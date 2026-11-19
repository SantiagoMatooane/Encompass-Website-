export function limited(concurrency, maxWaiting=32) {
  const waiting=[];
  let active=0;
  return async function run(task) {
    if(active>=concurrency) {
      if(waiting.length>=maxWaiting) throw Object.assign(Error('The queue is full. Try again shortly.'),{status:429});
      await new Promise(resolve=>waiting.push(resolve));
    } else active++;
    try { return await task(); }
    finally { if(waiting.length) waiting.shift()(); else active--; }
  };
}
