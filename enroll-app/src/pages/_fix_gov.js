
var fs=require('fs');
var govs=[
  ['government/aid-home','scholarship','getScholarshipList','tab:"todo",role:"government"','scholarshipId'],
  ['government/aid-final-home','scholarship','getScholarshipList','tab:"processing",role:"government"','scholarshipId'],
  ['government/loan-home','scholarship','getLoanList','tab:"todo",role:"government"','loanId'],
  ['government/loan-final-home','scholarship','getLoanList','tab:"processing",role:"government"','loanId'],
  ['government/dorm-home','dormitory','getRoomChangeApplications','role:"government"','applicationId'],
  ['government/room-change','dormitory','getRoomChangeApplications','role:"government"','applicationId'],
  ['government/non-dorm','dormitory','getWithdrawApplications','role:"government"','applicationId'],
];
govs.forEach(function(g){
  var dir=g[0],apiMod=g[1],apiFn=g[2],args=g[3],uid=g[4];
  var c=fs.readFileSync(dir+'/index.vue','utf8');
  c=c.replace(/import {.*} from '.*businessState.*'/g,"import { "+apiMod+"Api } from '@/common/api/"+apiMod+".js'");
  c=c.replace(/onLoads*(s*)s*{[sS]*?
  },?/g,'');
  c=c.replace(/onUnloads*(s*)s*{[sS]*?
  },?/g,'');
  c=c.replace(/onShows*(s*)s*{[sS]*?methods:s*{/g,'async onShow(){ this.filterVersion++; await this.refresh() }, methods:{');
  c=c.replace(/refreshs*([^)]*)s*{[sS]*?
  },?/g,'async refresh(){ try{ var r=await '+apiMod+'Api.'+apiFn+'({pageNum:1,pageSize:200,'+args+'}); if(r&&r.code===0) this.list=(r.data.items||[]).map(function(i){return{...i,uid:i.'+uid+'}}) }catch(e){} },');
  c=c.replace(/getLastBusinessChange([^)]+)/g,'null');
  c=c.replace(/syncActiveTabFromLastChanges*([^)]*)s*{[sS]*?
  },?/g,'');
  fs.writeFileSync(dir+'/index.vue',c);
  console.log(dir+': DONE');
});
console.log('--- all gov done ---');
