import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { coachHandler, responseText } from '../_shared/coachHandler.ts';
const url=Deno.env.get('SUPABASE_URL')??'';
const key=Deno.env.get('SUPABASE_ANON_KEY')??''; // Runtime injected public client key, never service-role.
const apiKey=Deno.env.get('OPENAI_API_KEY');
const model=Deno.env.get('OPENAI_MODEL');
function client(token:string){return createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});}
Deno.serve(coachHandler({
  configured:()=>!!apiKey&&!!model,
  verifyUser:async token=>{const {data,error}=await client(token).auth.getUser(token);return !error&&!!data.user;},
  quota:async token=>{const {data,error}=await client(token).rpc('claim_on_track_coach_request');if(error)throw error;return data===true;},
  generate:async facts=>{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),body:JSON.stringify({model,store:false,max_output_tokens:400,instructions:'You help daily follow-through and motivation. Use only the provided dated facts. Unknown is unreported, not overeating. Give one brief factual observation and one concrete evening logging action, under 120 words. Do not diagnose, body-shame, prescribe calorie targets or reward eating less. Corrections preserve honesty. Never claim trends without measured coverage.',input:JSON.stringify(facts)})});if(!response.ok)throw new Error('Upstream review failed');return responseText(await response.json());},
}));
