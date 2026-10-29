const assert=require('node:assert/strict');
const g=require('../../src/core/ui/learning_game.js');
const x=g.fixtures(),s=g.session(x);let checks=0;
for(const c of x.cases)for(const step of c.steps){const t=step.evaluate(),a={};for(const key of Object.keys(step.weights))a[key]=t[key];assert.equal(g.grade(step,a).points,100);checks++;}
const b=x.cases[0].steps[1],t=b.evaluate();assert.equal(g.grade(b,{...t,call:'In control'}).points,-60);checks++;
const st=x.cases[1].steps[2],real=x.cases[1].steps[3];assert.equal(st.evaluate().sentinel,true);assert.equal(real.evaluate().sentinel,false);assert.equal(g.grade(st,{...st.evaluate(),call:'Positive'}).unsafe,true);checks++;
assert.equal(g.grade(b,t,1).points,70);assert.equal(g.grade(b,t,2).points,50);assert.equal(g.grade(b,t,3).points,30);checks++;
s.commit('chart-baseline','decision',{...t,call:'In control'});assert.equal(s.summary().unresolvedUnsafe,1);s.commit('chart-baseline','decision',t,'No limits',100000);assert.equal(s.summary().unresolvedUnsafe,0);checks++;
for(const c of x.cases)for(const step of c.steps)s.commit(c.id,step.id,step.evaluate(),'reason',999999);
assert.equal(s.summary().passed,true);assert.equal(s.records[0].score.unsafe,true);assert.equal(s.summary().badges.length,0);checks++;
assert.equal(x.rows.filter(r=>r.cq===40).length,21);assert.equal(x.rows.filter(r=>r.nativeStatus==='Detected').length,2);checks++;
assert.equal(g.grade(b,t,0).points,g.grade(b,t,0).points);assert(!JSON.stringify(s.summary()).includes('latency'));checks++;
console.log(JSON.stringify({checks,passed:true,summary:s.summary()},null,2));
