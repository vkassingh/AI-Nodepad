import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notesApi from '../api/notesApi';

const Home = () => {
  const { isLoggedIn, user, logoutUser, loading } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, loading, navigate]);

  // Fetch notes from the API
  const fetchNotes = async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await notesApi.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again.');
      if (error.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotes();
    }
  }, [isLoggedIn]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingNote) {
      setEditingNote({ ...editingNote, [name]: value });
    } else {
      setNewNote({ ...newNote, [name]: value });
    }
  };

  // Handle note creation or update
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingNote) {
        // Update an existing note
        await notesApi.put(`/api/notes/${editingNote._id}`, editingNote);
        setEditingNote(null);
      } else {
        // Create a new note
        await notesApi.post('/api/notes', newNote);
        setNewNote({ title: '', content: '' });
      }
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error submitting note:', error);
      setError('Failed to save note. Please check your connection and try again.');
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesApi.delete(`/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note.');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingNote(null);
    setNewNote({ title: '', content: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">My Notes</h1>
          {user && <p className="text-gray-600 mt-1">Welcome, {user.username}!</p>}
        </div>
        <button
          onClick={logoutUser}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-lg"
        >
          Logout
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Note Form for Create/Update */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {editingNote ? 'Edit Note' : 'Create New Note'}
        </h2>
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={editingNote ? editingNote.title : newNote.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Content</label>
            <textarea
              name="content"
              value={editingNote ? editingNote.content : newNote.content}
              onChange={handleInputChange}
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            ></textarea>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-lg"
            >
              {editingNote ? 'Update Note' : 'Add Note'}
            </button>
            {editingNote && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center text-gray-500">Loading notes...</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No notes found. Create your first note!
            </p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{note.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;