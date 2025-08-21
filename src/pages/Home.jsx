import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notesApi from '../api/notesApi';

const Home = () => {
  const { isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null); // stores the note being edited

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch notes from the API
  const fetchNotes = async () => {
    try {
      const response = await notesApi.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
    try {
      if (editingNote) {
        // Update an existing note
        await notesApi.put(`/notes/${editingNote._id}`, editingNote);
        setEditingNote(null);
      } else {
        // Create a new note
        await notesApi.post('/notes', newNote);
        setNewNote({ title: '', content: '' });
      }
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error submitting note:', error);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (id) => {
    try {
      await notesApi.delete(`/notes/${id}`);
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">My Notes</h1>
        <button
          onClick={logoutUser}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-lg"
        >
          Logout
        </button>
      </header>

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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-lg"
          >
            {editingNote ? 'Update Note' : 'Add Note'}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">No notes found. Create one!</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{note.title}</h3>
                <p className="text-gray-700">{note.content}</p>
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
    </div>
  );
};

export default Home;