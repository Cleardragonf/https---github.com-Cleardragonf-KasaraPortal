export interface HomeProps {
    title: string;
    description: string;
}

export interface AppState {
    isAuthenticated: boolean;
}

export type RouteParams = {
    id: string;
};