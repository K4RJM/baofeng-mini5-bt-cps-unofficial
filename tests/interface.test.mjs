// Executes the real UI handlers against a minimal DOM and simulated transport.
// It does not replace browser visual or physical-radio checks.
import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {renderRadioTutorial} from '../radio-help.mjs';
import {readDat,writeDat} from '../dat.mjs';import {validateEdits} from '../validation.mjs';import {Writer,makePlan,verificationMessage} from '../writer.mjs';import {decodeRadio,radioDat} from '../radio-decoder.mjs';import {blankData,emptyChannel,removeChannels,insertChannel,moveChannel} from '../channels.mjs';import {configureFields,form,optionalForm,vfoForm,visibleName,visibleTone,editedName,isFrequencyField,padFrequency} from '../fields.mjs';import {simulatedRadio} from './simulate.mjs';import {schemas,fixture} from './fixtures.mjs';
test('single-screen safety controls, read/write locks, reset prompt, idle timeout and native backups',async()=>{
 const nodes=new Map();class Element{
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.listeners={};this.value='';this.checked=false;this.classList={toggle(){},add(){},remove(){}};this.style={};}
  append(...xs){this.children.push(...xs);}replaceChildren(...xs){this.children=xs;}setAttribute(k,v){this[k]=v;}
  get lastChild(){return this.children.at(-1);}
  addEventListener(k,f){(this.listeners[k]??=[]).push(f);}checkValidity(){return !this.invalid;}reportValidity(){return !this.invalid;}
  showModal(){this.open=true;}close(){this.open=false;}click(){return this.onclick?.();}
  set innerHTML(v){this.html=v;for(const match of v.matchAll(/id="([^"]+)"/g))nodes.set(match[1],new Element('input'));}get innerHTML(){return this.html;}
  querySelectorAll(selector){return this.children.filter(x=>x instanceof Element).flatMap(x=>[...((selector==='[data-key]'&&x.dataset.key)||(selector===x.tag)?[x]:[]),...x.querySelectorAll(selector)]);}
 }
 const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);};const doc={getElementById:get,createElement:tag=>new Element(tag),documentElement:new Element('html'),addEventListener(){}};
 globalThis.document=doc;const win={isSecureContext:true,addEventListener(){}};let now=1000000,interval,download;
 const originalConnect=Writer.prototype.connect,connections=[];Writer.prototype.connect=async function(){const sim=simulatedRadio(this);connections.push(sim);};
 const ctx=vm.createContext({document:doc,window:win,navigator:{bluetooth:{}},localStorage:{getItem(){},setItem(){}},structuredClone,Blob,Uint8Array,console,Date:{now:()=>now},URL:{createObjectURL(b){download=b;return 'mock';},revokeObjectURL(){}},setTimeout(){},setInterval(f){interval=f;},confirm:()=>true,fetch:async p=>({json:async()=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)))}),readDat,writeDat,validateEdits,Writer,makePlan,verificationMessage,decodeRadio,radioDat,blankData,emptyChannel,removeChannels,insertChannel,moveChannel,configureFields,form,optionalForm,vfoForm,visibleName,visibleTone,editedName,isFrequencyField,padFrequency,renderRadioTutorial});
 try{
  const source=fs.readFileSync(new URL('../app.mjs',import.meta.url),'utf8').replace(/^import .*$/gm,'');await vm.runInContext('(async()=>{'+source+'})()',ctx);
  assert.equal(get('writeRadio').disabled,true);assert.equal(connections.length,0);
  get('help').click();
  const diagramButtons=get('content').querySelectorAll('button').filter(b=>b.dataset.radioKey);
  const tutorialPanel=get('content').querySelectorAll('section').find(s=>s.id==='radioTutorialPanel');
  const tutorialText=()=>tutorialPanel.querySelectorAll('h3').map(e=>e.textContent).join(' ');
  assert.equal(diagramButtons.length,23);
  diagramButtons.find(b=>b.dataset.radioKey==='0').onmouseenter();assert.match(tutorialText(),/Number keys — frequency and channel entry/);assert.match(tutorialText(),/Longpress/);assert.ok(tutorialPanel.querySelectorAll('li').some(e=>e.textContent.includes('enter weather mode')));
  diagramButtons.find(b=>b.dataset.radioKey==='8').click();assert.match(tutorialText(),/Number keys — frequency and channel entry/);assert.match(tutorialText(),/Longpress/);assert.ok(tutorialPanel.querySelectorAll('li').some(e=>e.textContent.includes('change transmit power')));
  diagramButtons.find(b=>b.dataset.radioKey==='star').onfocus();assert.match(tutorialText(),/repeater functions/);assert.match(tutorialText(),/Longpress/);
  diagramButtons.find(b=>b.dataset.radioKey==='sk1').click();assert.match(tutorialText(),/configurable side key/);assert.ok(tutorialPanel.querySelectorAll('p').some(p=>p.textContent==='Current workspace assignment: Channel scan'));
  assert.equal(connections.length,0);assert.equal(get('writeRadio').disabled,true);
  get('tabs').querySelectorAll('button').find(b=>b.textContent.includes('Channels')).click();

  const bytes=writeDat(fixture(),schemas);get('file').files=[{name:'synthetic.dat',arrayBuffer:async()=>bytes}];await get('file').onchange();assert.equal(get('writeRadio').disabled,false);
  get('writeRadio').click();assert.equal(get('warning').open,true);assert.equal(get('confirmWrite').disabled,true);await get('confirmWrite').click();assert.equal(connections.length,0);get('cancelWrite').click();assert.equal(connections.length,0);
  get('writeRadio').click();get('hasBackup').checked=true;get('hasBackup').onchange();await get('confirmWrite').click();assert.equal(connections.length,1);assert.equal(connections[0].writes().length,262);assert.equal(get('writeRadio').disabled,true);assert.equal(get('verify').disabled,false);assert.match(get('status').textContent,/not verified/);
  await get('confirmWrite').click();assert.equal(connections[0].writes().length,262);
  get('verify').click();assert.equal(get('resetSession').open,true);assert.equal(connections[0].sent.filter(x=>x[0]===82).length,0);get('resetCancel').click();assert.equal(connections.length,1);
  get('verify').click();await get('resetReady').click();assert.equal(connections.length,2);assert.match(get('status').textContent,/VERIFIED/);assert.equal(connections[1].writes().length,0);
  await get('readRadio').click();assert.equal(get('connection').textContent,'Connected');assert.equal(get('writeRadio').disabled,false);assert.equal(get('backup').disabled,false);assert.match(get('status').textContent,/loaded/);
  get('backup').click();const saved=readDat(new Uint8Array(await download.arrayBuffer()),schemas);assert.equal(saved.channelList[0].filter(c=>c.rxFreq).length,2);
  get('writeRadio').click();get('hasBackup').checked=true;get('hasBackup').onchange();const upload=Writer.prototype.upload;Writer.prototype.upload=async function(){this.report={stage:'write-incomplete-or-uncertain',acknowledged:0,totalBlocks:262};this.disconnect();throw Error('Simulated uncertain write');};try{await get('confirmWrite').click();}finally{Writer.prototype.upload=upload;}assert.equal(get('writeRadio').disabled,true);assert.match(get('status').textContent,/Do not retry automatically/);
  get('readRadio').click();assert.equal(get('resetSession').open,true);await get('resetReady').click();assert.equal(get('writeRadio').disabled,false);
  const writeCount=connections.reduce((n,s)=>n+s.writes().length,0);now+=600001;interval();assert.equal(get('idle').open,true);get('idleKeep').click();assert.equal(get('idle').open,false);now+=600001;interval();now+=60001;interval();assert.equal(get('connection').textContent,'Not connected');assert.equal(connections.reduce((n,s)=>n+s.writes().length,0),writeCount);
  const previousStatus=get('status').textContent;get('file').files=[{name:'bad.dat',arrayBuffer:async()=>Uint8Array.of(255)}];await get('file').onchange();assert.match(get('status').textContent,/current workspace retained/);get('save').click();assert.equal(readDat(new Uint8Array(await download.arrayBuffer()),schemas).channelList[0].filter(c=>c.rxFreq).length,2);assert.notEqual(previousStatus,get('status').textContent);
  const add=()=>get('content').querySelectorAll('button').find(b=>b.textContent==='+ Add channel').click();
  const enter=(k,value)=>{get('fields').querySelectorAll('[data-key]').find(input=>input.dataset.key===k).value=value;};
  add();enter('rxFreq','146.52');enter('txFreq','146.52');get('apply').click();assert.equal(get('editor').open,false);get('save').click();let edited=readDat(new Uint8Array(await download.arrayBuffer()),schemas);assert.equal(edited.channelList[0][1].rxFreq,'146.52000');assert.equal(edited.channelList[0][1].txFreq,'146.52000');
  add();enter('rxFreq','147');get('apply').click();get('save').click();edited=readDat(new Uint8Array(await download.arrayBuffer()),schemas);assert.equal(edited.channelList[0][3].rxFreq,'147.00000');assert.equal(edited.channelList[0][3].txFreq,'');
  add();enter('rxFreq','146.520001');get('apply').click();assert.equal(get('editor').open,true);assert.match(get('editErrors').textContent,/five decimal places/);get('cancel').click();
 }finally{Writer.prototype.connect=originalConnect;delete globalThis.document;}
});
