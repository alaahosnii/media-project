import { useState, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast, type Id } from 'react-toastify';

const initialState = {
  title: '',
  director: '',
  releaseYear: '',
  type: 'MOVIE',
  description: '',
  poster: null as File | null,
  images: [] as File[],
  budget: '',
  location: '',
  duration: '',
};

// Utility to convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AddMovie = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toastId, setToastId] = useState<Id | null>(null);
  const navigate = useNavigate();
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.director.trim()) newErrors.director = 'Director is required';
    if (!form.releaseYear || isNaN(Number(form.releaseYear))) newErrors.releaseYear = 'Valid year required';
    if (!form.type) newErrors.type = 'Type is required';
    if (!form.poster) newErrors.poster = 'Poster is required';
    if (form.budget && isNaN(Number(form.budget))) newErrors.budget = 'Budget must be a number';
    if (form.duration && isNaN(Number(form.duration))) newErrors.duration = 'Duration must be a number';
    return newErrors;
  };

  // Mutation function for adding a movie
  const addMovieMutation = useMutation({
    mutationFn: async (form: typeof initialState) => {
      let posterBase64 = '';
      if (form.poster) {
        posterBase64 = await fileToBase64(form.poster);
      }
      const imagesBase64 = await Promise.all(form.images.map(fileToBase64));
      const body = {
        title: form.title,
        director: form.director,
        releaseYear: Number(form.releaseYear),
        type: form.type,
        description: form.description,
        poster: posterBase64,
        images: imagesBase64,
        budget: form.budget ? Number(form.budget) : undefined,
        location: form.location,
        duration: form.duration ? Number(form.duration) : undefined,
      };
      const res = await axiosInstance.post('/movies', body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res;
    },
    onMutate: () => {
      const id = toast.loading('Adding media...');
      setToastId(id);
    },
    onSuccess: () => {
      toast.update(toastId!, {
        render: 'Media added successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        draggable: false,
        onClose: () => navigate('/'),
      });
    },
    onError: (err: any) => {
      toast.update(toastId!, {
        render: err?.response?.data?.message || 'Failed to add media.',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
        draggable: false,
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'poster') {
      setForm(f => ({ ...f, poster: files[0] }));
    } else if (name === 'images') {
      setForm(f => ({ ...f, images: Array.from(files) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    addMovieMutation.mutate(form);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-2">
      <form
        className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 border border-white/30"
        onSubmit={handleSubmit}
      // removed encType
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-2">Add New Media</h2>
        {/* Toasts handle feedback */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.title ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
            placeholder="Media title"
          />
          {errors.title && <span className="text-rose-500 text-sm">{errors.title}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Director</label>
          <input
            type="text"
            name="director"
            value={form.director}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.director ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
            placeholder="Director name"
          />
          {errors.director && <span className="text-rose-500 text-sm">{errors.director}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Release Year</label>
          <input
            type="number"
            name="releaseYear"
            value={form.releaseYear}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.releaseYear ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
            placeholder="e.g. 2024"
          />
          {errors.releaseYear && <span className="text-rose-500 text-sm">{errors.releaseYear}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.type ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
          >
            <option value="MOVIE">Movie</option>
            <option value="TV_SHOW">TV Show</option>
          </select>
          {errors.type && <span className="text-rose-500 text-sm">{errors.type}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none min-h-[80px]"
            placeholder="Media description (optional)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Budget</label>
          <input
            type="number"
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.budget ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
            placeholder="e.g. 160000000"
          />
          {errors.budget && <span className="text-rose-500 text-sm">{errors.budget}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input input-bordered w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:outline-none"
            placeholder="e.g. Los Angeles"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            className={`input input-bordered w-full px-4 py-2 rounded-lg border ${errors.duration ? 'border-rose-400' : 'border-gray-300'} focus:border-indigo-500 focus:outline-none`}
            placeholder="e.g. 148"
          />
          {errors.duration && <span className="text-rose-500 text-sm">{errors.duration}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Poster</label>
          <input
            type="file"
            name="poster"
            accept="image/*"
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
          />
          {errors.poster && <span className="text-rose-500 text-sm">{errors.poster}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Gallery Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            ref={imagesInputRef}
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white rounded-lg font-bold text-lg shadow hover:from-indigo-600 hover:to-sky-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={addMovieMutation.isPending}
        >
          {addMovieMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Adding Media...
            </span>
          ) : 'Add Media'}
        </button>
      </form>
    </div>
  );
};

export default AddMovie; 