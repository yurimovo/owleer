

export type ScheduledMeetingsType = {
    created_at: string,
    duration: number,
    host_id: string,
    id: number,
    join_url: string,
    start_time: string,
    timezone: string,
    topic: string,
    type: number,
    uuid: string
};

export type UserMeetingsType = {
    meetings: Array<ScheduledMeetingsType>,
    next_page_token: string,
    page_size: number,
    total_records: number
};

export type RecurrenceMeetingType = {
    end_date_time: string,
    end_times: number,
    monthly_day: number,
    monthly_week: number,
    monthly_week_day: number,
    repeat_interval: number,
    type: number,
    weekly_days: string,
}

export type ApprovedOrDeniedCountriesOrRegionsMeetingType = {
    approved_list: Array<string>,
    denied_list: Array<string>,
    enable: boolean,
    method: string
}

export type AuthenticationExceptionType = {
    email: string,
    name: string
}

export type RoomsMeetingType = {
    name: string,
    participants: string
}

export type BreakoutRoomType = {
    enable: string,
    rooms: RoomsMeetingType
}

export type InterpretersType = {
    email: string,
    languages: string
}

export type MeetingInvites = {
    email: string
}

export type NewMeetingSettingsType = {
    additional_data_center_regions: Array<string>,
    allow_multiple_devices: boolean,
    alternative_hosts: string,
    alternative_hosts_email_notification: boolean,
    approval_type: number,
    approved_or_denied_countries_or_regions: ApprovedOrDeniedCountriesOrRegionsMeetingType,
    audio: string,
    authentication_domains: string,
    authentication_exception: AuthenticationExceptionType,
    authentication_option: string,
    auto_recording: string,
    breakout_room: BreakoutRoomType,
    calendar_type: number,
    close_registration: boolean,
    contact_email: string,
    contact_name: string,
    email_notification: boolean,
    encryption_type: string,
    focus_mode: boolean,
    global_dial_in_countries: Array<string>,
    host_video: string,
    jbh_time: number,
    join_before_host: boolean,
    language_interpretation: Array<InterpretersType>,
    meeting_authentication: boolean,
    meeting_invitees: Array<MeetingInvites>,
    mute_upon_entry: boolean,
    participant_video: boolean,
    private_meeting: boolean,
    registrants_confirmation_email: boolean,
    registrants_email_notification: boolean,
    registration_type: number,
    show_share_button: boolean,
    use_pmi: boolean,
    waiting_room: boolean,
    watermark: boolean
}

export type TrackingFields = {
    field: string,
    value: string
}

export type NewMeetingType = {
    agenda: string,
    default_password: boolean,
    duration: number,
    password: string,
    pre_schedule: boolean,
    recurrence: RecurrenceMeetingType,
    schedule_for: string,
    settings: NewMeetingSettingsType,
    start_time: string,
    template_id: string,
    timezone: string,
    topic: string,
    tracking_fields: Array<TrackingFields>,
    type: number
}