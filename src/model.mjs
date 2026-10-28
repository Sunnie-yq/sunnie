export const categories = ['work','life','study','else'];
export const statuses = ['todo','pending','completed','cancelled'];
export function createTask(text, category = 'work', due = '') {
  const title = text.trim();
  if (!title) throw new Error('A task needs a title');
  return {id:crypto.randomUUID(), title:title.slice(0,500), category:categories.includes(category)?category:'else', due, status:'todo', previousStatus:'todo'};
}
export function toggleTask(task) {
  if (task.status === 'completed') return {...task,status:['todo','pending','cancelled'].includes(task.previousStatus)?task.previousStatus:'todo'};
  return {...task,previousStatus:task.status,status:'completed'};
}
export function reorder(tasks, from, to) {
  const result = [...tasks]; const a=result.findIndex(t=>t.id===from); const b=result.findIndex(t=>t.id===to);
  if(a<0||b<0||a===b) return result;
  const [task]=result.splice(a,1); result.splice(b,0,task); return result;
}
export function loadTasks(raw) {
  try { const parsed=JSON.parse(raw); if(!Array.isArray(parsed)) return [];
    const seen=new Set();
    return parsed.filter(t=>t && typeof t.id==='string' && !seen.has(t.id) && seen.add(t.id) && typeof t.title==='string' && categories.includes(t.category) && statuses.includes(t.status)).map(t=>({...t,title:t.title.slice(0,500),due:typeof t.due==='string' && /^\d{4}-\d{2}-\d{2}$/.test(t.due)?t.due:''}));
  } catch {return [];}
}
