import json
import time

print json.dumps({'bar': ('baz', None, 1.0, 2), 'hi':'1'})
time.sleep(3)
print json.dumps({'bar': ('baz', None, 1.0, 2), 'hi':'2'})
time.sleep(3)