"""Dependency-free builder checks; no experimental data or passwords."""
import importlib.util, pathlib, unittest, hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('missy_build',ROOT/'build/build.py')
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
class BuilderTests(unittest.TestCase):
 def test_baseline_identity(self):
  paths=[line.strip() for line in (ROOT/'build/all.manifest').read_text().splitlines() if line.strip() and not line.startswith('#')]
  self.assertEqual(hashlib.md5(b''.join(builder.read_module(p) for p in paths)).hexdigest(),'3bf60501a9eeb08166df9bb024fd8495')
 def test_source_escape_refused(self):
  with self.assertRaises(SystemExit):builder.read_module('../NOTICE.txt')
 def test_canonical_loop_refused(self):
  with self.assertRaises(SystemExit):builder.read_module('core/../core/helpers.js',('core/helpers.js',))
 def test_missing_module_refused(self):
  with self.assertRaises(SystemExit):builder.read_module('does_not_exist.js')
if __name__=='__main__':unittest.main()
