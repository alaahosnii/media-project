type LoginForm = {
    email: string;
    password: string;
}

type ErrorResponse = {
    status: boolean;
    message: string;
}

type User = {
    id: string;
    email: string;
    name: string;
}

type LoginResponse = {
    status: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    }
}

type RegisterForm = {
    name: string;
    email: string;
    password: string;
}

type Media = {
    id: number;
    title: string;
    description?: string | null;
    releaseYear: number;
    createdAt: string; // or Date, depending on how you handle dates in your API
    updatedAt: string; // or Date
    type: 'MOVIE' | 'TV_SHOW';
    director: string;
    budget: number;
    location: string;
    duration: number;
    posterId?: number | null;
    // Relations (if you want to include them)
    images?: Image[];
    poster?: Image | null;
};

type Image = {
    id: number;
    url: string;
    showId: number;
    createdAt: string; // or Date
    updatedAt: string; // or Date
    // posterFor?: Media | null; // if you want to include reverse relation
};

export type { LoginForm, ErrorResponse, User, LoginResponse, RegisterForm, Media, Image };