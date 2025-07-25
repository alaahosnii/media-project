//3 TanStack Libraries!!!
import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  keepPreviousData,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
// MUI imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import type { Media } from "../types/Types";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import type { Image } from '../types/Types';
import { toast } from 'react-toastify';

type EditMediaForm = Partial<Omit<Media, 'poster' | 'images'>> & {
  poster?: Image | File | null;
  images?: (Image | File)[];
};

const fetchMovies = async ({ pageParam = 1, queryKey }: { pageParam?: number, queryKey: any }) => {
  // queryKey: ['movies', debouncedSearch, type, releaseYear, director]
  const [, search, type, releaseYear, director] = queryKey;
  const res = await axiosInstance.get(`/movies`, {
    params: {
      page: pageParam,
      limit: 20,
      search,
      type,
      releaseYear,
      director,
    },
  });
  if (res.status !== 200) throw new Error('Network response was not ok');
  return res.data;
};

const Home = () => {
  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = useState<SortingState>([])

  // Search and filter state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [director, setDirector] = useState('');
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Update columns for Movie
  const columns = useMemo<ColumnDef<Media>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'director',
        header: 'Director',
      },
      {
        accessorKey: 'releaseYear',
        header: 'Release Year',
      },
      {
        accessorKey: 'genre',
        header: 'Genre',
      },
    ],
    []
  )

  // Use react-query's useInfiniteQuery to fetch movies
  const {
    data,
    fetchNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      'movies',
      debouncedSearch,
      type,
      releaseYear,
      director,
    ],
    queryFn: ({ pageParam = 1, queryKey }) => fetchMovies({ pageParam, queryKey }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Flatten the array of arrays from the useInfiniteQuery hook
  const flatData: Media[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  // Unique release years and directors for filter options
  const releaseYearOptions = useMemo(() => {
    const years = Array.from(new Set(flatData.map(m => m.releaseYear).filter(Boolean)));
    return years.sort((a, b) => b - a); // Descending order
  }, [flatData]);
  const directorOptions = useMemo(() => {
    const directors = Array.from(new Set(flatData.map(m => m.director).filter(Boolean)));
    return directors.sort();
  }, [flatData]);

  // Called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 100 &&
          !isFetching
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false, // set to true if you want to implement server-side sorting
    debugTable: true,
  });

  // scroll to top of table when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = updater => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  table.setOptions(prev => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== 'undefined' &&
        navigator.userAgent.indexOf('Firefox') === -1
        ? (element: HTMLDivElement) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  // Edit/Delete dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Media | null>(null);
  const [editForm, setEditForm] = useState<EditMediaForm>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Utility to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Prepare payload for backend
  const prepareEditPayload = async (form: EditMediaForm) => {
    // Poster
    let posterBase64 = '';
    if (form.poster && form.poster instanceof File) {
      posterBase64 = await fileToBase64(form.poster);
    }
    // Images
    let imagesBase64: string[] = [];
    if (Array.isArray(form.images)) {
      imagesBase64 = await Promise.all(
        form.images.map(img =>
          img instanceof File ? fileToBase64(img) : (img.url || '')
        )
      );
    }
    // Build payload
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      type: form.type,
      director: form.director,
      budget: form.budget ? Number(form.budget) : undefined,
      location: form.location,
      duration: form.duration ? Number(form.duration) : undefined,
      poster: posterBase64 || (form.poster && !(form.poster instanceof File) ? form.poster.url : undefined),
      images: imagesBase64,
    };
  };

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (form: EditMediaForm) => {
      const payload = await prepareEditPayload(form);
      const res = await axiosInstance.put(`/movies/${payload.id}`, payload);
      if (res.status !== 200) throw new Error('Failed to update');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie updated successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setEditOpen(false);
    },
    onError: () => {
      toast.error('Failed to update movie', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await axiosInstance.delete(`/movies/${id}`);
      if (res.status !== 200) throw new Error('Failed to delete');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete movie', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    },
  });

  // Custom MUI theme for table
  const tableTheme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#f4f6fa',
        paper: '#fff',
      },
    },
  });

  return (
    <div>
      {/* Enhanced Search and Filter Controls */}
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3, borderRadius: 3, background: '#f8fafc' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flexWrap="wrap"
        >
          <TextField
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 220 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                search && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={() => setSearch('')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              ),
            }}
          />
          <TextField
            select
            label="Type"
            value={type}
            onChange={e => setType(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 140 } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="MOVIE">Movie</MenuItem>
            <MenuItem value="TV_SHOW">TV Show</MenuItem>
            {/* Add more types as needed */}
          </TextField>
          <TextField
            select
            label="Release Year"
            value={releaseYear}
            onChange={e => setReleaseYear(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 120 } }}
          >
            <MenuItem value="">All</MenuItem>
            {releaseYearOptions.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Director"
            value={director}
            onChange={e => setDirector(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 160 } }}
          >
            <MenuItem value="">All</MenuItem>
            {directorOptions.map(d => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
          {(search || type) && (
            <IconButton
              aria-label="reset filters"
              onClick={() => { setSearch(''); setType(''); setReleaseYear(''); setDirector(''); }}
              color="primary"
              size="medium"
              sx={{ ml: { xs: 0, sm: 1 }, alignSelf: { xs: 'flex-end', sm: 'center' } }}
            >
              <ClearIcon />
            </IconButton>
          )}
        </Stack>
      </Paper>
      <div className="mb-2 text-gray-700">({flatData.length} movies fetched)</div>
      {
        isLoading ? (
          <div className="flex flex-col justify-center items-center py-8 h-screen">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) :
          <ThemeProvider theme={tableTheme}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 600,
                  overflow: 'auto',
                  width: '100%',
                  borderRadius: 3,
                  // boxShadow: 4,
                  // mt: 2,
                }}
                onScroll={(e: React.UIEvent<HTMLDivElement>) => fetchMoreOnBottomReached(e.currentTarget)}
                ref={tableContainerRef}
              >
                <Table stickyHeader sx={{ minWidth: { xs: 0, sm: 650 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          borderTopLeftRadius: 12,
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >ID</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >Title</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >Director</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >Release Year</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >Type</TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'common.white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '1rem' },
                          letterSpacing: 1,
                          borderTopRightRadius: 12,
                          textAlign: 'center',
                          px: { xs: 0.5, sm: 2 },
                        }}
                      >Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flatData.map((movie: Media, idx) => (
                      <TableRow
                        key={movie.id}
                        hover
                        onClick={e => {
                          // Prevent navigation if clicking on an action button
                          if ((e.target as HTMLElement).closest('button')) return;
                          navigate(`/media/${movie.id}`);
                        }}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: idx % 2 === 0 ? 'background.paper' : 'grey.100',
                          transition: 'background 0.2s',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{movie.id}</TableCell>
                        <TableCell sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{movie.title}</TableCell>
                        <TableCell sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{movie.director}</TableCell>
                        <TableCell sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{movie.releaseYear}</TableCell>
                        <TableCell sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{movie.type}</TableCell>
                        <TableCell sx={{ textAlign: 'center', px: { xs: 0.5, sm: 2 } }}>
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => {
                              setSelectedMovie(movie);
                              setEditForm(movie);
                              setEditOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => {
                              setSelectedMovie(movie);
                              setDeleteOpen(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {editOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={() => setEditOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-indigo-700">Edit Movie</h2>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={e => {
                      e.preventDefault();
                      editMutation.mutate(editForm);
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Title</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        value={editForm.title || ''}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Description</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        value={editForm.description || ''}
                        onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Director</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        value={editForm.director || ''}
                        onChange={e => setEditForm(f => ({ ...f, director: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Release Year</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        type="number"
                        value={editForm.releaseYear ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, releaseYear: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        value={editForm.type || ''}
                        onChange={e => setEditForm(f => ({ ...f, type: e.target.value as Media['type'] }))}
                        required
                      >
                        <option value="MOVIE">Movie</option>
                        <option value="TV_SHOW">TV Show</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Budget</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        type="number"
                        value={editForm.budget ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, budget: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Location</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        value={editForm.location || ''}
                        onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Duration (minutes)</label>
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500"
                        type="number"
                        value={editForm.duration ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, duration: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      />
                    </div>
                    {/* Poster display and upload */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Poster</label>
                      {editForm.poster && (
                        <img
                          src={
                            (typeof editForm.poster === 'object' && 'url' in editForm.poster && editForm.poster.url) ? editForm.poster.url :
                              (editForm.poster instanceof File ? URL.createObjectURL(editForm.poster) : undefined)
                          }
                          alt="Poster"
                          className="w-32 h-48 object-cover rounded-lg mb-2 border border-gray-200 shadow"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          setEditForm(f => {
                            const { poster, ...rest } = f;
                            return { ...rest, poster: file };
                          });
                        }}
                      />
                    </div>
                    {/* Images gallery display and upload */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Gallery Images</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Array.isArray(editForm.images) && editForm.images.map((img: any, idx: number) => (
                          <div key={img.id || idx} className="relative group">
                            <img
                              src={
                                (typeof img === 'object' && 'url' in img && img.url) ? img.url :
                                  (img instanceof File ? URL.createObjectURL(img) : '')
                              }
                              alt={`Gallery ${idx}`}
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700 shadow group-hover:opacity-100 opacity-0 transition"
                              onClick={() => setEditForm(f => {
                                const { images, ...rest } = f;
                                return { ...rest, images: (images || []).filter((_: any, i: number) => i !== idx) };
                              })}
                              aria-label="Remove image"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          setEditForm(f => {
                            const { images, ...rest } = f;
                            return { ...rest, images: [...(images || []), ...files] };
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                        onClick={() => setEditOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                        disabled={editMutation.isPending}
                      >
                        {editMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {deleteOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={() => setDeleteOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-red-700">Delete Movie</h2>
                  <div className="mb-6 text-gray-700">
                    Are you sure you want to delete <b>{selectedMovie?.title}</b>?
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => setDeleteOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
                      onClick={() => deleteMutation.mutate(selectedMovie?.id!)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ThemeProvider>
      }

    </div>
  );
};

export default Home;
