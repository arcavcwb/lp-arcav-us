import copy
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from qa_gate import validate

class QAGateTests(unittest.TestCase):
    def setUp(self):
        self.pr = dict(number=2,state='open',draft=False,base={'ref':'main'},head={'sha':'abc'},user={'login':'author'})
        self.reviews = [dict(state='APPROVED',commit_id='abc',user={'login':'reviewer','type':'User'},submitted_at='2026-09-13T10:00:00Z')]
        self.report = dict(pr=2,revision='abc',result='approved',qa_run='fixture',operator='qa fixture',completed_at='2026-09-13T11:00:00+00:00',evidence_url='https://example.invalid/fixture',pending_checks=[],blockers=[],checks=[dict(criterion='fixture',command_or_steps='fixture',result='passed',evidence='fixture')])

    def test_valid_declarations(self):
        self.assertEqual(validate(self.pr,self.reviews,self.report),[])

    def test_no_review_self_review_stale_review_and_bot_block(self):
        self.assertTrue(validate(self.pr,[],self.report))
        for change in ({'user':{'login':'author','type':'User'}},{'commit_id':'old'},{'user':{'login':'bot','type':'Bot'}}):
            r=copy.deepcopy(self.reviews[0]); r.update(change)
            self.assertTrue(validate(self.pr,[r],self.report))

    def test_qa_before_review_stale_sha_empty_checks_or_pending_block(self):
        for change in ({'completed_at':'2026-09-13T09:00:00+00:00'},{'revision':'old'},{'checks':[]},{'pending_checks':['test']},{'result':'blocked'}):
            report=copy.deepcopy(self.report); report.update(change)
            self.assertTrue(validate(self.pr,self.reviews,report))
