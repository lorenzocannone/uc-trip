export interface Viber {
        id: string;
        first_name: string;
        last_name: string;
        label: string;
        email: string;
        vibepic_url: string;
    }

export interface Vibe {
    id?: string;
    type?: string;
    name?: string;
    day?: number;
    day_position?: number;
    date?: Date;
    time?: Date;
    reference?: string;
    estimated_cost?: number;
    location?: string;
    vibers?: Viber[];
    description?: string;
    trip_id?: string;
}

export interface Trip {
    id?: string;
    destination?: string;
    vibers?: Viber[];
    first_night?: Date;
    last_night?: Date;
    days?: number;
    vibes?: Vibe[];
    role?: string
}