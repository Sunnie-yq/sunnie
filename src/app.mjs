import {categories,statuses,createTask,toggleTask,reorder,loadTasks} from './model.mjs';
const $=s=>document.querySelector(s), desktop=window.desktop;
let tasks=[];try{tasks=loadTasks(localStorage.getItem('sunnie.tasks.v1'));}catch{}
let active='todo', collapsed=new Set(), closeTimer, dragging=false, dragId;
const labels={todo:'To-do',pending:'Pending',completed:'Completed',cancelled:'Cancelled'};
const caps=s=>s[0].toUpperCase()+s.slice(1);
function persist(){try{localStorage.setItem('sunnie.tasks.v1',JSON.stringify(tasks));$('#error').hidden=true;}catch{$('#error').textContent='Storage is full or unavailable. Changes may not survive a restart.';$('#error').hidden=false;}render();}
function open(){clearTimeout(closeTimer);$('#orb').hidden=true;$('#panel').hidden=false;desktop?.expand(true);}
function close(){if(dragging)return;$('#panel').hidden=true;$('#orb').hidden=false;desktop?.expand(false);}
$('#widget').addEventListener('mouseenter',open);
$('#widget').addEventListener('mouseleave',()=>{closeTimer=setTimeout(close,450);});
$('#widget').addEventListener('focusin',()=>clearTimeout(closeTimer));
$('#orb').addEventListener('click',open);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.activeElement.blur();close();}});
$('#quit').onclick=()=>desktop?desktop.quit():close();
$('#today').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}).toUpperCase();
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function render(){
 $('#orb-count').textContent=tasks.filter(t=>t.status==='todo'||t.status==='pending').length;
 const tabs=$('#tabs');tabs.replaceChildren();tabs.setAttribute('role','tablist');
 statuses.forEach(status=>{const b=element('button','',labels[status]);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',status===active);b.append(element('span','count',tasks.filter(t=>t.status===status).length));b.onclick=()=>{active=status;render();};tabs.append(b);});
 const visible=tasks.filter(t=>t.status===active);$('#task-count').textContent=`${visible.length} ${visible.length===1?'task':'tasks'}`;$('#list-caption').textContent=active==='todo'?'YOUR TO-DOS':labels[active].toUpperCase();
 const groups=$('#groups');groups.replaceChildren();
 if(!visible.length){const empty=element('div','empty');empty.append(element('span','empty-symbol','✳'),element('div','',active==='todo'?'A fresh start, a clearer mind.':`No ${labels[active].toLowerCase()} tasks.`),element('div','','Add a little intention below.'));groups.append(empty);}
 categories.forEach(category=>{
  const items=visible.filter(t=>t.category===category);if(!items.length)return;
  const group=element('section',`group ${category}`), head=element('button','group-head');head.type='button';head.setAttribute('aria-expanded',!collapsed.has(category));head.append(element('span','dot'),element('span','',caps(category)),element('span','number',items.length),element('span','arrow',collapsed.has(category)?'›':'⌄'));head.onclick=()=>{collapsed.has(category)?collapsed.delete(category):collapsed.add(category);render();};group.append(head);
  if(!collapsed.has(category))items.forEach(task=>{
   const row=element('div',`task ${task.status}`);row.draggable=true;
   row.ondragstart=e=>{dragId=task.id;dragging=true;e.dataTransfer.setData('text/plain',task.id);row.classList.add('dragging');};row.ondragend=()=>{dragging=false;dragId=null;row.classList.remove('dragging');};row.ondragover=e=>{e.preventDefault();row.classList.add('over');};row.ondragleave=()=>row.classList.remove('over');row.ondrop=e=>{e.preventDefault();row.classList.remove('over');if(dragId){tasks=reorder(tasks,dragId,task.id);dragging=false;persist();}};
   const checkbox=element('input');checkbox.type='checkbox';checkbox.checked=task.status==='completed';checkbox.setAttribute('aria-label',`Mark ${task.title} ${checkbox.checked?'incomplete':'complete'}`);checkbox.onchange=()=>{tasks=tasks.map(t=>t.id===task.id?toggleTask(t):t);persist();};
   const body=element('div','task-body');body.append(element('div','task-title',task.title));
   if(task.due){const date=new Date(task.due+'T12:00:00');const now=new Date();now.setHours(0,0,0,0);const overdue=date<now&&['todo','pending'].includes(task.status);body.append(element('span',`task-date${overdue?' overdue':''}`,`${overdue?'◷ Overdue · ':'◷ '}${date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:date.getFullYear()!==now.getFullYear()?'numeric':undefined})}`));}
   const actions=element('div','task-actions'), select=element('select');select.setAttribute('aria-label',`Status for ${task.title}`);select.title='Change status';statuses.forEach(s=>{const o=element('option','',labels[s]);o.value=s;select.append(o);});select.value=task.status;select.onchange=()=>{task.previousStatus=task.status;task.status=select.value;persist();};
   const del=element('button','','×');del.type='button';del.title='Delete task';del.setAttribute('aria-label',`Delete ${task.title}`);del.onclick=()=>{tasks=tasks.filter(t=>t.id!==task.id);persist();};actions.append(select,del);row.append(checkbox,body,actions);group.append(row);
  });groups.append(group);
 });
}
$('#add-form').onsubmit=e=>{e.preventDefault();if(!$('#title').value.trim())return;tasks.push(createTask($('#title').value,$('#category').value,$('#due').value));active='todo';collapsed.delete($('#category').value);$('#title').value='';persist();$('#title').focus();};
for(const handle of [$('#handle'),$('#orb')])handle.addEventListener('pointerdown',async e=>{
 if(e.button!==0||e.target.closest('#quit'))return;
 const startX=e.screenX,startY=e.screenY;let origin, moved=false, released=false;
 const move=ev=>{if(!origin)return;const dx=ev.screenX-startX,dy=ev.screenY-startY;if(Math.abs(dx)+Math.abs(dy)>4){moved=true;dragging=true;desktop?.move(origin[0]+dx,origin[1]+dy);}};
 const end=()=>{released=true;document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',end);dragging=false;if(moved)clearTimeout(closeTimer);};
 document.addEventListener('pointermove',move);document.addEventListener('pointerup',end,{once:true});origin=await desktop?.position();if(released)end();
});
render();
