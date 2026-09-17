import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('vikunja', Path(__file__).resolve().parents[1] / 'tools/vikunja_sync.py')
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)
POLICY = dict(project_id=2, snapshot_view_id=11, sprint_label='sprint-1', role_labels={'role:frontend':'frontend-dev-agent'}, task_keys={'4':'lp-arcav-us:US-03'})
DATA = dict(project_id=2, view_id=11, project_title='Fixture', tasks=[dict(id=4,title='Fixture',done=True,updated='2026-09-13T00:00:00Z',labels=['sprint-1','role:frontend'], description='[x] declared',buckets=[])])


class SyncTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.target = Path(temp.name) / 'sprint_actual.md'
        self.target.write_text('Previous valid snapshot')

    def test_complete_remote_read_atomic_idempotent_and_no_inferred_completion(self):
        with patch.object(v, 'snapshot', return_value=DATA):
            self.assertTrue(v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1'))
            first = self.target.read_bytes()
            self.assertFalse(v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1'))
            self.assertEqual(first, self.target.read_bytes())
            v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1', check=True)
        text = first.decode()
        self.assertIn('done=true | no verificada | no verificado', text)
        self.assertIn('frontend-dev-agent', text)
        self.assertNotIn('[x]', text)

    def test_timeout_and_concurrent_remote_update_preserve_previous(self):
        changed = copy.deepcopy(DATA)
        changed['tasks'][0]['done'] = False
        for effect in (v.SyncError('timeout'), [DATA, changed]):
            with patch.object(v, 'snapshot', side_effect=effect):
                with self.assertRaises(v.SyncError):
                    v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1')
                self.assertEqual(self.target.read_text(), 'Previous valid snapshot')

    def test_local_row_edit_detected_despite_matching_digest(self):
        with patch.object(v, 'snapshot', return_value=DATA):
            v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1')
            self.target.write_text(self.target.read_text().replace('done=true', 'done=false'))
            with self.assertRaises(v.SyncError):
                v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1', check=True)

    def test_partial_or_duplicate_pages_fail(self):
        c = v.Client('https://example.invalid', 'fake')
        h = {'x-pagination-total-pages':'2', 'x-pagination-result-count':'2'}
        for second in ([{'id':1}], []):
            with patch.object(c, 'get', side_effect=[([{'id':1}],h),(second,h)]):
                with self.assertRaises(v.SyncError):
                    c.pages('/tasks')

    def test_all_pages_loaded(self):
        c = v.Client('https://example.invalid', 'fake')
        h = {'x-pagination-total-pages':'2', 'x-pagination-result-count':'2'}
        with patch.object(c, 'get', side_effect=[([{'id':1}],h),([{'id':2}],h)]):
            self.assertEqual(c.pages('/tasks'), [{'id':1},{'id':2}])

    def test_filtered_view_rejected(self):
        c = v.Client('https://example.invalid', 'fake')
        project = dict(id=2, views=[dict(id=11, view_kind='table', filter={'filter':'done=false'})])
        with patch.object(c, 'get', return_value=(project, {})):
            with self.assertRaises(v.SyncError): v.snapshot(c, POLICY)

    def test_local_write_failure_preserves_snapshot(self):
        with patch.object(v, 'snapshot', return_value=DATA), patch.object(v.os, 'replace', side_effect=OSError('fixture')):
            with self.assertRaises(OSError): v.sync(None, POLICY, self.target, 'https://example.invalid/api/v1')
        self.assertEqual(self.target.read_text(), 'Previous valid snapshot')

    def test_redirect_denied(self):
        with self.assertRaises(v.SyncError):
            v.NoRedirect().redirect_request(None,None,302,'',{},'https://other.invalid')
