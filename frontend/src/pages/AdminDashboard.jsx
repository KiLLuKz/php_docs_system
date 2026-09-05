import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { FileText, Upload, Trash2, Users, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Upload Form state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    is_public: 0,
    file: null
  });

  const fetchData = async () => {
    try {
      const [docsRes, usersRes] = await Promise.all([
        axiosClient.get('/documents'),
        axiosClient.get('/users')
      ]);
      setDocuments(docsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <ShieldAlert className="w-20 h-20 text-error mb-4" />
        <h2 className="text-2xl font-bold text-[#ffffff]">Access Denied</h2>
        <p className="text-[#ffffff]/70 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axiosClient.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      alert('Failed to delete document');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('is_public', uploadData.is_public);
    formData.append('file', uploadData.file);

    try {
      await axiosClient.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsUploadModalOpen(false);
      setUploadData({ title: '', description: '', is_public: 0, file: null });
      fetchData(); // refresh list
    } catch (error) {
      alert('Failed to upload document');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const userId = e.target.user_id.value;
    try {
      await axiosClient.post(`/documents/${selectedDocId}/assign`, { user_id: userId });
      setIsAssignModalOpen(false);
      alert('Assigned successfully');
    } catch (error) {
      alert('Failed to assign user');
    }
  };



  return (
    <div className="w-full space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center bg-base-100 p-6 rounded-none md:rounded-[18px] border-b md:border border-hairline mt-0 md:mt-8 mx-0 md:mx-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-[#ffffff]/60 mt-1 text-[17px]">Manage documents and access permissions</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary rounded-full mt-4 md:mt-0 px-6 font-normal"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Document
        </button>
      </div>

      <div className="bg-base-100 md:rounded-[18px] border-y md:border border-hairline overflow-hidden mx-0 md:mx-8">
        {loading ? (
          <div className="flex justify-center p-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-[#000000]/20 text-[14px]">
                <tr>
                  <th className="font-semibold tracking-wide">Document</th>
                  <th className="font-semibold tracking-wide">Status</th>
                  <th className="font-semibold tracking-wide">Upload Date</th>
                  <th className="text-right font-semibold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#000000]/10 transition-colors border-hairline">
                    <td>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-[17px]">{doc.title}</div>
                          <div className="text-[14px] text-[#ffffff]/60">{doc.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {doc.is_public ? (
                        <div className="px-3 py-1 bg-success/15 text-success rounded-md text-[12px] font-medium inline-block uppercase tracking-wider">
                          Public
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-warning/15 text-warning rounded-md text-[12px] font-medium inline-block uppercase tracking-wider">
                          Private
                        </div>
                      )}
                    </td>
                    <td className="text-[#ffffff]/70 text-[14px]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {!doc.is_public && (
                          <button 
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setIsAssignModalOpen(true);
                            }}
                            className="btn btn-sm btn-ghost hover:bg-info/20 text-info font-normal"
                            title="Assign to User"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Assign
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="btn btn-sm btn-ghost hover:bg-error/20 text-error"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-[#ffffff]/50 text-[17px]">
                      No documents found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <dialog className={`modal ${isUploadModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box relative">
          <button 
            onClick={() => setIsUploadModalOpen(false)} 
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-xl mb-6">Upload New Document</h3>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Document Title</span></label>
              <input 
                type="text" 
                required
                className="input input-bordered w-full" 
                value={uploadData.title}
                onChange={e => setUploadData({...uploadData, title: e.target.value})}
              />
            </div>
            
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Description</span></label>
              <textarea 
                className="textarea textarea-bordered w-full h-24" 
                value={uploadData.description}
                onChange={e => setUploadData({...uploadData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Visibility</span></label>
              <select 
                className="select select-bordered w-full"
                value={uploadData.is_public}
                onChange={e => setUploadData({...uploadData, is_public: parseInt(e.target.value)})}
              >
                <option value={0}>Private (Requires Assignment)</option>
                <option value={1}>Public (Visible to everyone)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">PDF File</span></label>
              <input 
                type="file" 
                accept="application/pdf"
                required
                className="file-input file-input-bordered w-full file-input-primary" 
                onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
              />
            </div>

            <div className="modal-action mt-6">
              <button type="submit" className="btn btn-primary w-full">
                <Upload className="w-5 h-5 mr-2" />
                Upload File
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setIsUploadModalOpen(false)}></form>
      </dialog>

      {/* Assign User Modal */}
      <dialog className={`modal ${isAssignModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box relative">
          <button 
            onClick={() => setIsAssignModalOpen(false)} 
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-xl mb-6">Assign Document to User</h3>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Select User</span></label>
              <select name="user_id" required className="select select-bordered w-full">
                <option value="" disabled selected>Choose a user...</option>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>
                ))}
              </select>
            </div>

            <div className="modal-action mt-6">
              <button type="submit" className="btn btn-info w-full text-white">
                <Check className="w-5 h-5 mr-2" />
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setIsAssignModalOpen(false)}></form>
      </dialog>
    </div>
  );
};

export default AdminDashboard;
