import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import type { Media } from '../types/Types';

const fetchMovie = async (id: string) => {
    const res = await axiosInstance.get(`/movies/${id}`);
    if (res.status !== 200) throw new Error('Failed to fetch movie');
    return res.data as Media;
};

const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useQuery<Media>({
        queryKey: ['movie', id],
        queryFn: () => fetchMovie(id!),
        enabled: !!id,
    });

    if (isLoading) return (
        <div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900/80 to-indigo-400/60">
            <span className="relative flex h-16 w-16">
                <span className="animate-spin absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-indigo-400 via-sky-400 to-indigo-600 opacity-30"></span>
                <span className="relative inline-flex rounded-full h-16 w-16 bg-white/10 border-4 border-indigo-400 border-t-transparent"></span>
            </span>
        </div>
    );
    if (isError || !data) return (
        <div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900/80 to-indigo-400/60">
            <div className="text-rose-400 text-xl font-bold">Failed to load movie details.</div>
        </div>
    );

    const movie = data;
    const bgPoster = movie?.poster?.url;

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Blurred background poster */}
            {bgPoster && (
                <img
                    src={bgPoster}
                    alt="background poster"
                    className="absolute inset-0 w-full h-full object-cover object-center blur-2xl scale-110 brightness-50 z-0 select-none pointer-events-none"
                />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-indigo-900/70 to-indigo-700/60 z-10" />
            {/* Main content */}
            <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-12 border border-white/20">
                {/* Poster */}
                {movie?.poster && movie?.poster.url && (
                    <img
                        src={movie?.poster.url}
                        alt={movie?.title + ' poster'}
                        className="w-64 h-96 object-cover rounded-2xl shadow-xl border-4 border-white/20 mb-6 md:mb-0"
                    />
                )}
                {/* Info */}
                <div className="flex-1 flex flex-col justify-center items-center md:items-start text-white">
                    <button
                        className="mb-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-sky-400 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-sky-500 transition-colors text-base self-center md:self-start"
                        onClick={() => navigate(-1)}
                    >
                        &larr; Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-center md:text-left drop-shadow-lg">{movie?.title}</h1>
                    <div className="w-full flex flex-col gap-2 mb-4 text-lg">
                        <div><span className="font-semibold text-indigo-200">ID:</span> <span className="text-white/90">{movie?.id}</span></div>
                        <div><span className="font-semibold text-indigo-200">Director:</span> <span className="text-white/90">{movie?.director}</span></div>
                        <div><span className="font-semibold text-indigo-200">Release Year:</span> <span className="text-white/90">{movie?.releaseYear}</span></div>
                        <div><span className="font-semibold text-indigo-200">Type:</span> <span className="text-white/90 capitalize">{movie?.type}</span></div>
                    </div>
                    {movie?.images && movie?.images.length > 0 && (
                        <div className="w-full mt-6">
                            <div className="font-semibold text-indigo-100 mb-3 text-xl">Gallery</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {movie?.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={img.url}
                                        alt={movie?.title + ' image'}
                                        className="w-full h-48 object-cover rounded-xl shadow-lg border-2 border-white/10 hover:scale-105 hover:z-30 hover:shadow-2xl transition-transform duration-200 cursor-pointer"
                                        loading="lazy"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetails; 