import React, { useState } from "react";
import "../components/Bucket.css";

import BucketListForm from "../components/BucketListForm";
import BucketFilters from "../../../components/bucket/BucketFilters";
import BucketTaskList from "../../../components/bucket/BucketTaskList";
import BucketProgressBar from "../../../components/bucket/BucketProgressBar";
import BucketConfirmModal from "../../../components/bucket/BucketConfirmModal";
import bucketApi from '../../../api/bucketApi';
import WeddingVisionForm from "../components/WeddingVisionForm";
import WeddingVisionGallery from "../components/WeddingVisionGallery";
import Modal from '../../../components/ui/Modal.jsx';

export default function BucketPage() {
  const [bucketItems, setBucketItems] = useState([]); // {id, title, category, targetDate, together, status, notes}
  const [weddingItems, setWeddingItems] = useState([]); // {id, type, title, description, imageUrl, link}

  const handleAddBucketItem = (item) => {
    // Save to backend then reload tasks and append locally
    (async () => {
      try {
        const payload = {
          title: item.title,
          category: item.category,
          targetDate: item.targetDate,
          assignedTo: !item.together || item.together === 'both' ? 'Both' : item.together,
          notes: item.notes,
        };

        const res = await bucketApi.addBucketItem(payload);
        const data = res.data?.data || res.data;
        // refresh task list
        await reload();
        setBucketItems((prev) => [data, ...prev]);
      } catch (err) {
        console.error('Failed to add bucket item', err);
        // fallback: optimistic local add
        setBucketItems((prev) => [item, ...prev]);
      }
    })();
  };

  const handleToggleBucketStatus = (id) => {
    setBucketItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "done" ? "pending" : "done",
              doneAt:
                item.status === "done" ? null : new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleAddWeddingItem = (item) => {
    setWeddingItems((prev) => [item, ...prev]);
  };

  const [activeTab, setActiveTab] = useState("bucket");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await bucketApi.getBucketItems();
        const items = res.data?.data || res.data;
        if (mounted) setTasks(items || []);
      } catch (e) { console.warn('Could not load bucket items', e); }
    })();
    // fetch partner names
    (async ()=>{
      try {
        const axiosClient = (await import('../../../api/axiosClient')).default;
        const r = await axiosClient.get('/couple/partners');
        const partnersData = r.data?.data || r.data;
        const list = [];
        if (partnersData?.partnerOne) list.push(partnersData.partnerOne);
        if (partnersData?.partnerTwo) list.push(partnersData.partnerTwo);
        if (mounted) setPartners(list);
      } catch (err) { console.warn('Failed to load partners', err); }
    })();
    return () => { mounted = false; };
  }, []);

  const [partners, setPartners] = React.useState([]);

  const reload = async () => {
    try {
      const res = await bucketApi.getBucketItems();
      setTasks(res.data?.data || res.data || []);
    } catch (e) { console.warn(e); }
  };

  const startOfToday = () => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  };

  const getFilteredTasks = (all, f) => {
    const today = startOfToday();
    if (!all || !Array.isArray(all)) return [];
    switch((f||'all').toLowerCase()) {
      case 'all': return all;
      case 'pending': return all.filter(t => !t.isCompleted);
      case 'approaching': return all.filter(t => {
        if (t.isCompleted) return false;
        if (!t.targetDate) return false;
        const diff = (new Date(t.targetDate) - today) / (1000*60*60*24);
        return diff >= 0 && diff <= 3;
      });
      case 'overdue': return all.filter(t => {
        if (t.isCompleted) return false;
        if (!t.targetDate) return false;
        const d = new Date(t.targetDate);
        d.setHours(0,0,0,0);
        return d < today;
      });
      case 'completed': return all.filter(t => !!t.isCompleted);
      default: return all;
    }
  };

  const handleDelete = async (item) => {
    const id = item && (item._id || item.id);
    if (!id) {
      console.error('[Bucket] delete called without id', item);
      return;
    }
    try {
      const res = await bucketApi.deleteBucketItem(id);
      console.log('[Bucket] delete response', res?.data || res);
      await reload();
    } catch (e) {
      console.warn('[Bucket] delete failed', e);
      if (e?.message) console.error(e.message);
    }
  };

  // Open a themed restore confirmation modal instead of restoring immediately
  const openRestore = (item) => {
    setPendingRestore(item);
    setRestoreConfirmOpen(true);
  };

  const confirmRestore = async () => {
    const item = pendingRestore;
    setRestoreConfirmOpen(false);
    if (!item) return;
    const id = item && (item._id || item.id);
    if (!id) return console.error('[Bucket] restore called without id', item);
    try {
      const res = await bucketApi.restoreBucketItem(id);
      console.log('[Bucket] restore response', res?.data || res);
      await reload();
      setPendingRestore(null);
    } catch (e) { console.warn('[Bucket] restore failed', e); }
  };

  const openConfirm = (item) => { setPendingComplete(item); setConfirmOpen(true); };

  const openDetail = (item) => { setSelectedTask(item); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setSelectedTask(null); };

  const confirmComplete = async () => {
    if (!pendingComplete) return setConfirmOpen(false);
    try {
      const id = pendingComplete && (pendingComplete._id || pendingComplete.id);
      if (!id) {
        console.error('[Bucket] complete called without id', pendingComplete);
        setConfirmOpen(false);
        setPendingComplete(null);
        return;
      }
      const res = await bucketApi.completeBucketItem(id);
      console.log('[Bucket] complete response', res?.data || res);
      setConfirmOpen(false);
      setPendingComplete(null);
      await reload();
    } catch (e) { console.warn(e); setConfirmOpen(false); }
  };

  return (
    <div className="bucket-wrapper">
      <div className="bucket-overlay" />

      <div className="bucket-inner">
        {/* Header */}
        <header className="bucket-header">
          
        </header>

        <div className="bucket-tabs">
          <button
            type="button"
            className={`bucket-tab-btn ${activeTab === "bucket" ? "bucket-tab-btn-active" : ""}`}
            onClick={() => setActiveTab("bucket")}
          >
            Bucket List
          </button>

          <button
            type="button"
            className={`bucket-tab-btn ${activeTab === "wedding" ? "bucket-tab-btn-active" : ""}`}
            onClick={() => setActiveTab("wedding")}
          >
            Wedding Vision
          </button>
        </div>

        <section className={`bucket-sections ${activeTab === 'both' ? 'two-col' : 'single-col'}`}>
          {activeTab === "bucket" && (
            <div className="bucket-section bucket-list-section">
              <div className="section-header">
                <h2>Bucket List</h2>
                <p className="section-sub">Goals, adventures and couple challenges.</p>
              </div>
            

            <div className="bucket-block">
              <BucketListForm onAdd={handleAddBucketItem} partners={partners} />
            </div>

            <div className="bucket-block">
              <BucketFilters active={filter} onChange={(f)=>setFilter(f)} />
            </div>

            <div className="bucket-block">
              <BucketProgressBar completed={tasks.filter(t=>t.isCompleted).length} total={tasks.length} />
            </div>

            <div className="bucket-block">
              <BucketTaskList tasks={getFilteredTasks(tasks, filter)} activeFilter={filter} showCompletedSection={filter==='completed'} onDelete={handleDelete} onRestore={openRestore} onOpenConfirm={openConfirm} onOpenDetail={openDetail} />
            </div>

            <BucketConfirmModal open={confirmOpen} title={pendingComplete?.title} onCancel={()=>setConfirmOpen(false)} onConfirm={confirmComplete} />
            <Modal isOpen={detailOpen} onClose={closeDetail} title={selectedTask?.title} size="lg">
              {selectedTask && (
                <div>
                  <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
                    <div className="tag small default">{selectedTask.category || 'General'}</div>
                    <div style={{color:'var(--text-secondary)'}}>{selectedTask.targetDate ? new Date(selectedTask.targetDate).toLocaleDateString() : 'No date'}</div>
                    <div style={{color:'var(--text-secondary)'}}>{selectedTask.isCompleted ? 'Completed' : selectedTask.status}</div>
                  </div>

                  <div style={{marginTop:12}}><strong>For:</strong> {selectedTask.assignedTo || 'Both'}</div>

                  <div style={{marginTop:12,color:'var(--text-secondary)'}}>
                    <strong>Notes</strong>
                    <div style={{marginTop:6}}>{selectedTask.notes || 'No notes'}</div>
                  </div>
                </div>
              )}
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button onClick={() => { handleDelete(selectedTask); closeDetail(); }} className="hover-accent" style={{background:'transparent',border:'1px solid var(--card-border)',padding:'8px 12px',borderRadius:8}}>Delete</button>
                <button onClick={async ()=>{ try { if (selectedTask.isCompleted) { openRestore(selectedTask); } else { await bucketApi.completeBucketItem(selectedTask._id || selectedTask.id); setCelebrate(true); setTimeout(()=>setCelebrate(false),2200); } await reload(); const res = await bucketApi.getBucketItem(selectedTask._id || selectedTask.id); setSelectedTask(res.data?.data || res.data); } catch(e){console.warn(e);} }} style={{background:'linear-gradient(90deg,var(--accent-secondary),var(--accent-primary))',border:'none',padding:'8px 12px',borderRadius:8,color:'#fff'}}>
                  {selectedTask?.isCompleted ? 'Mark Uncomplete' : 'Mark Complete'}
                </button>
              </div>
            </Modal>
            <Modal isOpen={restoreConfirmOpen} onClose={()=>setRestoreConfirmOpen(false)} title={pendingRestore ? `Restore “${pendingRestore.title}”?` : 'Restore'}>
              <div style={{paddingTop:6}}>Are you sure you want to restore this memory back to pending?</div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                <button onClick={()=>setRestoreConfirmOpen(false)} style={{background:'transparent',border:'1px solid var(--card-border)',padding:'8px 12px',borderRadius:8}}>Cancel</button>
                <button onClick={async ()=>{ await confirmRestore(); setRestoreConfirmOpen(false); closeDetail(); }} style={{background:'linear-gradient(90deg,var(--accent-secondary),var(--accent-primary))',border:'none',padding:'8px 12px',borderRadius:8,color:'#fff'}}>Restore</button>
              </div>
            </Modal>
            </div>
          )}

          {activeTab === "wedding" && (
            <div className="bucket-section wedding-vision-section">
              <div className="section-header">
                <h2>Wedding Vision</h2>
                <p className="section-sub">Inspiration, photos and vendor links.</p>
              </div>

              <div className="bucket-block">
                <WeddingVisionForm onAdd={handleAddWeddingItem} />
              </div>

              <div className="bucket-block">
                <WeddingVisionGallery items={weddingItems} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
