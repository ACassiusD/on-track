import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

test('web charts keep accessibility on the image container without leaking native SVG props', () => {
const fs=require('fs');
const Module=require('module');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resolve=name=>require.resolve(name,{paths:[root]});
const ts=require(resolve('typescript'));
const React=require(resolve('react'));
const {renderToStaticMarkup}=require(resolve('react-dom/server'));
const original=Module._load;
let state;
Module._load=function(name,parent,main){
 if(name==='react-native')return original(resolve('react-native-web'),parent,main);
 if(name==='react-native-svg')return original(root+'/node_modules/react-native-svg/lib/commonjs/elements.web.js',parent,main);
 if(name.endsWith('/store/AppStore'))return {useApp:()=>state};
 if(name==='./UI')return {Label:({children})=>React.createElement('span',null,children)};
 return original(name,parent,main);
};
const oldTs = require.extensions['.ts']; const oldTsx = require.extensions['.tsx'];
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const {WeightChart}=require(root+'/src/components/WeightChart.tsx');
const {initialState}=require(root+'/src/domain/model.ts');
const {themes}=require(root+'/src/components/themes.ts');
const initial=initialState('2026-09-30');
const errors=[];const previous=console.error;console.error=(...args)=>errors.push(args.join(' '));
const single = { ...initial.real, weights: initial.demo.weights.filter(w => w.date === '2026-09-30') };
for(const data of [initial.real,initial.demo,single]){
 state={data,today:'2026-09-30',palette:themes['Default']};
 const html=renderToStaticMarkup(React.createElement(WeightChart));
 if(!html.includes('role="img"'))throw Error('Chart image semantics missing');
 if(data.weights.length && !html.includes('<svg'))throw Error('Populated chart missing SVG');
 if(!data.weights.length && html.includes('<svg'))throw Error('Empty chart should show a simple prompt instead of placeholder axes');
 if(/<svg[^>]*accessible=/.test(html))throw Error('Native accessible prop leaked onto SVG');
 if(data === single && (!/d="M36,([\d.]+) L314,\1"/.test(html) || html.includes('First reading saved') || html.includes('09-03'))) throw Error('First weigh-in must show a flat single-day baseline without extra text or dates');
}
console.error=previous;
Module._load=original; require.extensions['.ts']=oldTs; require.extensions['.tsx']=oldTsx;
if(errors.length)throw Error(errors.join('\n'));
console.log('Empty and populated charts render with image semantics and no React console errors.');

});
