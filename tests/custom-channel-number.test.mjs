import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appHarness} from './app-harness.mjs';

test('Add channel chooses an empty custom slot 999 with Show empty slots off',async()=>{
 const h=await appHarness();try{
  await h.open();
  h.button('+ Add channel').click();
  const slot=h.get('channelNumberChoice');
  assert.equal(slot.value,'2');
  slot.value='999';slot.oninput();
  h.enter('rxFreq','146.52000');h.enter('txFreq','146.52000');h.enter('name','CUSTOM999');
  h.get('apply').click();
  assert.equal(h.get('editor').open,false);
  const output=await h.exported();
  assert.equal(output.channelList[0][998].name,'CUSTOM999');
  assert.equal(output.channelList[0][998].rxFreq,'146.52000');
  assert.equal(output.channelList[0][1].rxFreq,'');
  assert.equal(output.channelList[0][999].rxFreq,'');
  assert.equal(h.connections.length,0,'workspace edits do not contact the radio');
 }finally{h.close();}
});

test('Add channel defaults to first unused slot, preserves unrelated channels',async()=>{
 const h=await appHarness();try{
  await h.open();h.button('+ Add channel').click();
  assert.equal(h.get('channelNumberChoice').value,'2');
  h.enter('rxFreq','146.52000');h.enter('txFreq','146.52000');h.enter('name','SLOT2');
  h.get('apply').click();
  const output=await h.exported();
  assert.equal(output.channelList[0][1].name,'SLOT2');
  assert.equal(output.channelList[0][2].rxFreq,'446.00000');
 }finally{h.close();}
});

test('Add channel rejects an occupied slot without overwriting it',async()=>{
 const h=await appHarness();try{
  await h.open();const before=await h.exported();
  h.button('+ Add channel').click();
  const slot=h.get('channelNumberChoice');slot.value='3';slot.oninput();
  h.enter('rxFreq','146.52000');h.enter('txFreq','146.52000');h.enter('name','SHOULDNOT');
  h.get('apply').click();
  assert.equal(h.get('editor').open,true);
  assert.match(h.get('editErrors').textContent,/already occupied/);
  assert.deepEqual(await h.exported(),before);
 }finally{h.close();}
});

test('Add channel rejects out of range number, never changes hidden slot 1000',async()=>{
 const h=await appHarness();try{
  await h.open();const before=await h.exported();
  h.button('+ Add channel').click();
  const slot=h.get('channelNumberChoice');slot.value='1000';slot.oninput();
  h.enter('rxFreq','146.52000');h.enter('txFreq','146.52000');h.enter('name','INVALID');
  h.get('apply').click();
  assert.equal(h.get('editor').open,true);
  assert.deepEqual(await h.exported(),before);
 }finally{h.close();}
});
