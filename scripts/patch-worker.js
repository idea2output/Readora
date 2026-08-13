import fs from 'fs';
import path from 'path';

function patchFile(filePath, searchStr, replaceStr) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchStr)) {
      content = content.replaceAll(searchStr, replaceStr);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Successfully patched: ${filePath}`);
    }
  }
}

const handlerPath = path.resolve('.open-next/server-functions/default/handler.mjs');

// 1. Safe nodeTimers assignments in fast-set-immediate.external.js
patchFile(
  handlerPath,
  'nodeTimers.setImmediate=patchedSetImmediate',
  '(function(){try{nodeTimers.setImmediate=patchedSetImmediate}catch(_){}})()'
);

patchFile(
  handlerPath,
  'nodeTimers.clearImmediate=patchedClearImmediate',
  '(function(){try{nodeTimers.clearImmediate=patchedClearImmediate}catch(_){}})()'
);

patchFile(
  handlerPath,
  'nodeTimersPromises.setImmediate=patchedSetImmediatePromise',
  '(function(){try{nodeTimersPromises.setImmediate=patchedSetImmediatePromise}catch(_){}})()'
);

patchFile(
  handlerPath,
  'process.nextTick=patchedNextTick',
  '(function(){try{process.nextTick=patchedNextTick}catch(_){}})()'
);

// 2. Safe module.prototype polyfill in require-hook.js
patchFile(
  handlerPath,
  'var path2=require("path"),mod3=require("module"),originalRequire=mod3.prototype.require',
  'var path2=require("path"),mod3=require("module");mod3.prototype=mod3.prototype||{require:function(r){return require(r);}};var originalRequire=mod3.prototype.require'
);
