import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bucketApi from '../../../api/bucketApi';
import Modal from '../../../components/ui/Modal.jsx';

export default function BucketDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showCelebrate, setShowCelebrate] = React.useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await bucketApi.getBucketItem(taskId);
        if (mounted) setTask(res.data?.data || res.data);
      } catch (e) { console.warn('Could not load task', e); }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [taskId]);

  const doDelete = async () => {
    if (!task) return;
    try {
      await bucketApi.deleteBucketItem(task._id || task.id);
      navigate('/bucket');
    } catch (e) { console.warn('Delete failed', e); }
  };

  const toggleComplete = async () => {
    if (!task) return;
    try {
      if (task.isCompleted) {
        // ask for confirmation before restoring
        setRestoreConfirmOpen(true);
        return;
      } else {
        await bucketApi.completeBucketItem(task._id || task.id);
        setShowCelebrate(true);
        setTimeout(()=>setShowCelebrate(false), 2500);
      }
      const res = await bucketApi.getBucketItem(task._id || task.id);
      setTask(res.data?.data || res.data);
    } catch (e) { console.warn('Toggle failed', e); }
  };

  const confirmRestore = async () => {
    if (!task) return setRestoreConfirmOpen(false);
    try {
      await bucketApi.restoreBucketItem(task._id || task.id);
      const res = await bucketApi.getBucketItem(task._id || task.id);
      setTask(res.data?.data || res.data);
    } catch (e) { console.warn('Restore failed', e); }
    setRestoreConfirmOpen(false);
  };

  if (loading) return <div style={{padding:24}}>Loading…</div>;
  if (!task) return <div style={{padding:24}}>Task not found</div>;

  return (
    <div style={{padding:20}}>
      <button onClick={() => navigate('/bucket')} style={{marginBottom:12}}>← Back</button>
      <div style={{background:'rgba(255,255,255,0.02)',padding:18,borderRadius:12}}>
        <h2 style={{margin:0}}>{task.title}</h2>
        <div style={{marginTop:8,display:'flex',gap:12}}>
          <div style={{padding:'4px 8px',background:'rgba(168,85,247,0.12)',borderRadius:8}}>{task.category || 'General'}</div>
          <div>{task.targetDate ? new Date(task.targetDate).toLocaleDateString() : 'No date'}</div>
          <div>{task.isCompleted ? 'Completed' : task.status}</div>
        </div>

        <div style={{marginTop:12}}>
          <strong>For:</strong> {task.assignedTo || 'Both'}
        </div>

        <div style={{marginTop:12,color:'#d6d6e4'}}>
          <strong>Notes</strong>
          <div style={{marginTop:6}}>{task.notes || 'No notes'}</div>
        </div>

        <div style={{marginTop:16,display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={doDelete} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.06)',padding:'8px 12px',borderRadius:8}}>Delete</button>
          <button onClick={toggleComplete} style={{background:'linear-gradient(90deg,#ec4899,#a855f7)',border:'none',padding:'8px 12px',borderRadius:8,color:'#fff'}}>
            {task.isCompleted ? 'Mark Uncomplete' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {showCelebrate && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'rgba(0,0,0,0.6)',position:'absolute',inset:0}} />
          <div style={{position:'relative',background:'#fff',padding:24,borderRadius:12,boxShadow:'0 20px 60px rgba(168,85,247,0.18)'}}>
            <h3>Congratulations! 🎉</h3>
            <p>{`You completed “${task.title}” together.`}</p>
          </div>
        </div>
      )}
      <Modal isOpen={restoreConfirmOpen} onClose={()=>setRestoreConfirmOpen(false)} title={`Restore “${task?.title}”?`}>
        <div>Are you sure you want to restore this memory back to pending?</div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
          <button onClick={()=>setRestoreConfirmOpen(false)} style={{background:'transparent',border:'1px solid rgba(0,0,0,0.06)',padding:'8px 12px',borderRadius:8}}>Cancel</button>
          <button onClick={confirmRestore} style={{background:'linear-gradient(90deg,#ec4899,#a855f7)',border:'none',padding:'8px 12px',borderRadius:8,color:'#fff'}}>Restore</button>
        </div>
      </Modal>
    </div>
  );
}
