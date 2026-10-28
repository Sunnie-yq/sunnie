import test from 'node:test';
import assert from 'node:assert/strict';
import {createTask,toggleTask,reorder,loadTasks} from '../src/model.mjs';
test('creates tasks and rejects blank titles',()=>{const t=createTask('  Ship it  ','study','2026-12-01');assert.equal(t.title,'Ship it');assert.equal(t.category,'study');assert.equal(t.status,'todo');assert.throws(()=>createTask('  '));});
test('completion remembers pending status',()=>{const t={...createTask('Read'),status:'pending'};assert.equal(toggleTask(t).status,'completed');assert.equal(toggleTask(toggleTask(t)).status,'pending');});
test('reorder preserves all task data',()=>{const a=createTask('a'),b=createTask('b'),c=createTask('c');assert.deepEqual(reorder([a,b,c],a.id,c.id),[b,c,a]);assert.deepEqual(reorder([a,b], 'missing',b.id),[a,b]);});
test('storage survives roundtrip and handles invalid or duplicate data',()=>{const t=createTask('<script>unsafe</script>');assert.deepEqual(loadTasks(JSON.stringify([t])),[t]);assert.equal(loadTasks(JSON.stringify([t,t,{id:'bad'}])).length,1);assert.deepEqual(loadTasks('broken'),[]);assert.deepEqual(loadTasks('{}'),[]);});
