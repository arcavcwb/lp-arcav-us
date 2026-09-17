import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import governance_gate as gate


class GovernanceTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        subprocess.run(['git', 'init', '-q', '-b', 'main', str(self.root)], check=True)
        self.git('config', 'user.email', 'test@example.invalid')
        self.git('config', 'user.name', 'Fixture')
        (self.root / 'config').mkdir()
        (self.root / 'config/governance.json').write_text(json.dumps({'product_status':'blocked_pending_human_approval'}))
        (self.root / 'PRD.md').write_text('Fixture PRD\n')
        self.git('add', '.')
        self.git('commit', '-qm', 'fixture')
        self.git('switch', '-qc', 'test/work')

    def git(self, *args):
        return gate.git(self.root, *args)

    def test_main_and_detached_block_even_documentation(self):
        for branch in ('main', 'master', 'HEAD', ''):
            self.assertTrue(gate.check(self.root, ['AGENTS.md'], branch, 'main'))

    def test_hardening_allowed_while_product_and_unknown_paths_block(self):
        self.assertFalse(gate.check(self.root, ['docs/protocolo.md'], 'chore/hardening', 'main'))
        for path in ('src/pages/index.astro', 'public/image.png', 'package.json', 'wrangler.jsonc', 'new-folder/file'):
            self.assertTrue(gate.check(self.root, [path], 'feat/test', 'main'))

    def approve(self):
        prd = (self.root / 'PRD.md').read_bytes()
        h = hashlib.sha256(prd).hexdigest()
        p = self.root / '.agyflow/approvals'
        p.mkdir(parents=True)
        (p / f'prd-{h}.json').write_text(json.dumps(dict(status='approved', sha256=h, document='PRD.md', person='Fixture', scope='Fixture', evidence='Fixture only', recorded_at='2026-09-13T00:00:00+00:00')))
        (self.root / 'architecture.md').write_text('Fixture architecture')
        (self.root / 'config/governance.json').write_text(json.dumps(dict(product_status='approved', activation_evidence='Fixture only')))
        self.git('add', '.')
        self.git('commit', '-qm', 'fixture approval')

    def test_human_can_submit_architecture_and_approval_in_separate_governance_pr(self):
        self.assertFalse(gate.check(self.root, ['architecture.md', '.agyflow/approvals/prd-fixture.json', 'config/governance.json'], 'docs/human-approval', 'main'))
        self.assertTrue(gate.check(self.root, ['architecture.md', 'src/product.py'], 'docs/human-approval', 'main'))

    def test_branch_cannot_approve_itself(self):
        self.approve()
        self.assertTrue(gate.check(self.root, ['src/x'], 'feat/test', 'main'))
        self.assertFalse(gate.check(self.root, ['src/x'], 'feat/test', 'HEAD'))

    def test_changed_prd_invalidates_approval(self):
        self.approve()
        (self.root / 'PRD.md').write_text('Changed PRD')
        self.assertTrue(gate.check(self.root, ['src/x'], 'feat/test', 'HEAD'))

    def test_staged_prd_cannot_be_hidden_by_worktree(self):
        self.approve()
        original = (self.root / 'PRD.md').read_text()
        (self.root / 'PRD.md').write_text('Unapproved staged scope')
        self.git('add', 'PRD.md')
        (self.root / 'PRD.md').write_text(original)
        self.assertTrue(gate.check(self.root, ['src/x'], 'feat/test', 'HEAD', ''))

    def test_missing_trusted_base_blocks(self):
        self.assertTrue(gate.check(self.root, [], 'feat/test', 'absent', product=True))
