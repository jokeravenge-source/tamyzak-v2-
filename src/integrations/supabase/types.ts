export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          elapsed_seconds: number
          is_running: boolean
          last_seen_at: string
          mission: string
          started_at: string
          subject: string
          user_id: string
        }
        Insert: {
          elapsed_seconds?: number
          is_running?: boolean
          last_seen_at?: string
          mission?: string
          started_at?: string
          subject: string
          user_id: string
        }
        Update: {
          elapsed_seconds?: number
          is_running?: boolean
          last_seen_at?: string
          mission?: string
          started_at?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notebooks: {
        Row: {
          cover_emoji: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          background_image_url: string | null
          blocks: Json
          cover_emoji: string | null
          created_at: string
          created_by: string | null
          id: string
          notebook_id: string | null
          published: boolean
          template: string
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          blocks?: Json
          cover_emoji?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notebook_id?: string | null
          published?: boolean
          template?: string
          title: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          blocks?: Json
          cover_emoji?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notebook_id?: string | null
          published?: boolean
          template?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "admin_notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advice_comments_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "advice_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      advice_topics: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          author_name: string
          body?: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ahmed_flashcard_overrides: {
        Row: {
          answer: string | null
          card_id: string
          chapter: number
          deleted: boolean
          language: string
          question: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          card_id: string
          chapter: number
          deleted?: boolean
          language: string
          question?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          card_id?: string
          chapter?: number
          deleted?: boolean
          language?: string
          question?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bank_problems: {
        Row: {
          chapter: number
          chapter_title: string | null
          created_at: string
          created_by: string | null
          difficulty: string
          final_answer: string | null
          formula: string | null
          given_data: string | null
          id: string
          language: string
          problem: string
          section: string | null
          solution: string
          sort_order: number
          source: string | null
          subject: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          chapter: number
          chapter_title?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          final_answer?: string | null
          formula?: string | null
          given_data?: string | null
          id?: string
          language?: string
          problem: string
          section?: string | null
          solution: string
          sort_order?: number
          source?: string | null
          subject: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          chapter?: number
          chapter_title?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          final_answer?: string | null
          formula?: string | null
          given_data?: string | null
          id?: string
          language?: string
          problem?: string
          section?: string | null
          solution?: string
          sort_order?: number
          source?: string | null
          subject?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      bank_text_questions: {
        Row: {
          answer: string
          chapter: number
          chapter_title: string | null
          created_at: string
          created_by: string | null
          difficulty: string
          id: string
          language: string
          question: string
          section: string | null
          sort_order: number
          source: string | null
          subject: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          answer: string
          chapter: number
          chapter_title?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          language?: string
          question: string
          section?: string | null
          sort_order?: number
          source?: string | null
          subject: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          answer?: string
          chapter?: number
          chapter_title?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: string
          id?: string
          language?: string
          question?: string
          section?: string | null
          sort_order?: number
          source?: string | null
          subject?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      battle_channel_settings: {
        Row: {
          chat_id: string
          enabled: boolean
          id: boolean
          invite_url: string
          updated_at: string
        }
        Insert: {
          chat_id?: string
          enabled?: boolean
          id?: boolean
          invite_url?: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          enabled?: boolean
          id?: boolean
          invite_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      battle_invites: {
        Row: {
          chapter: number
          created_at: string
          from_name: string
          from_user_id: string
          id: string
          language: string
          question_count: number
          room_code: string
          status: string
          subject: string
          to_user_id: string
          updated_at: string
        }
        Insert: {
          chapter?: number
          created_at?: string
          from_name?: string
          from_user_id: string
          id?: string
          language?: string
          question_count?: number
          room_code: string
          status?: string
          subject?: string
          to_user_id: string
          updated_at?: string
        }
        Update: {
          chapter?: number
          created_at?: string
          from_name?: string
          from_user_id?: string
          id?: string
          language?: string
          question_count?: number
          room_code?: string
          status?: string
          subject?: string
          to_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      canvases: {
        Row: {
          client_id: string
          created_at: string
          data: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          data?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          data?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_attempts: {
        Row: {
          challenge_id: string
          correct_count: number
          created_at: string
          display_name: string
          id: string
          total_count: number
          total_ms: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          correct_count?: number
          created_at?: string
          display_name?: string
          id?: string
          total_count?: number
          total_ms?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          correct_count?: number
          created_at?: string
          display_name?: string
          id?: string
          total_count?: number
          total_ms?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_questions: {
        Row: {
          answer_index: number
          challenge_id: string
          choices: Json
          created_at: string
          explanation: string | null
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_index: number
          challenge_id: string
          choices: Json
          created_at?: string
          explanation?: string | null
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer_index?: number
          challenge_id?: string
          choices?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_questions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          language: string
          seconds_per_question: number
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string
          seconds_per_question?: number
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string
          seconds_per_question?: number
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      channel_battles: {
        Row: {
          chapter: number
          created_at: string
          expires_at: string
          guest_user_id: string | null
          host_name: string
          host_seen_at: string
          host_user_id: string
          id: string
          language: string
          question_count: number
          room_key: string
          status: string
          subject: string
          telegram_chat_id: string | null
          telegram_message_id: number | null
          telegram_state: string
          telegram_synced_status: string | null
        }
        Insert: {
          chapter: number
          created_at?: string
          expires_at?: string
          guest_user_id?: string | null
          host_name: string
          host_seen_at?: string
          host_user_id: string
          id: string
          language: string
          question_count: number
          room_key?: string
          status?: string
          subject: string
          telegram_chat_id?: string | null
          telegram_message_id?: number | null
          telegram_state?: string
          telegram_synced_status?: string | null
        }
        Update: {
          chapter?: number
          created_at?: string
          expires_at?: string
          guest_user_id?: string | null
          host_name?: string
          host_seen_at?: string
          host_user_id?: string
          id?: string
          language?: string
          question_count?: number
          room_key?: string
          status?: string
          subject?: string
          telegram_chat_id?: string | null
          telegram_message_id?: number | null
          telegram_state?: string
          telegram_synced_status?: string | null
        }
        Relationships: []
      }
      character_unlocks: {
        Row: {
          character_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          character_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          character_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_friends: {
        Row: {
          created_at: string
          friend_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_post_reactions: {
        Row: {
          post_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          post_id: string
          reaction: string
          user_id: string
        }
        Update: {
          post_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          photo_paths: string[]
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          photo_paths?: string[]
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          photo_paths?: string[]
        }
        Relationships: []
      }
      course_chapters: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          enrolled_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_exam_answer_keys: {
        Row: {
          answer_path: string | null
          created_at: string
          exam_id: string
          key_text: string
          marks: Json
          question_count: number
          updated_at: string
        }
        Insert: {
          answer_path?: string | null
          created_at?: string
          exam_id: string
          key_text?: string
          marks?: Json
          question_count: number
          updated_at?: string
        }
        Update: {
          answer_path?: string | null
          created_at?: string
          exam_id?: string
          key_text?: string
          marks?: Json
          question_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_exam_answer_keys_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: true
            referencedRelation: "course_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      course_exam_completions: {
        Row: {
          completed_at: string
          course_id: string
          created_at: string
          exam_id: string
          graded_out_of: number | null
          id: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          created_at?: string
          exam_id: string
          graded_out_of?: number | null
          id?: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          created_at?: string
          exam_id?: string
          graded_out_of?: number | null
          id?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_exam_completions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "course_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      course_exam_plans: {
        Row: {
          acknowledged_step: number
          created_at: string
          full_name: string | null
          interval_days: number
          start_date: string
          subjects: string[]
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_step?: number
          created_at?: string
          full_name?: string | null
          interval_days?: number
          start_date?: string
          subjects?: string[]
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_step?: number
          created_at?: string
          full_name?: string | null
          interval_days?: number
          start_date?: string
          subjects?: string[]
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_exams: {
        Row: {
          answer_path: string
          chapter: string
          course_id: string
          created_at: string
          created_by: string | null
          exam_path: string
          id: string
          question_count: number | null
          question_marks: Json | null
          title: string
        }
        Insert: {
          answer_path: string
          chapter?: string
          course_id: string
          created_at?: string
          created_by?: string | null
          exam_path: string
          id?: string
          question_count?: number | null
          question_marks?: Json | null
          title: string
        }
        Update: {
          answer_path?: string
          chapter?: string
          course_id?: string
          created_at?: string
          created_by?: string | null
          exam_path?: string
          id?: string
          question_count?: number | null
          question_marks?: Json | null
          title?: string
        }
        Relationships: []
      }
      course_playlists: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          kind: string
          playlist_id: string | null
          title: string
          updated_at: string
          video_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          playlist_id?: string | null
          title: string
          updated_at?: string
          video_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          playlist_id?: string | null
          title?: string
          updated_at?: string
          video_id?: string | null
        }
        Relationships: []
      }
      course_students: {
        Row: {
          created_at: string
          full_name: string
          telegram_username: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          telegram_username: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          telegram_username?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_teachers: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_teachers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_video_views: {
        Row: {
          completed: boolean
          course_id: string
          id: string
          last_seen_at: string
          max_percent: number
          opened_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          id?: string
          last_seen_at?: string
          max_percent?: number
          opened_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          id?: string
          last_seen_at?: string
          max_percent?: number
          opened_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_video_views_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "course_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      course_videos: {
        Row: {
          bunny_library_id: string
          bunny_video_guid: string
          chapter_id: string
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_sec: number | null
          id: string
          is_published: boolean
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bunny_library_id: string
          bunny_video_guid: string
          chapter_id: string
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bunny_library_id?: string
          bunny_video_guid?: string
          chapter_id?: string
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_sec?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "course_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_published: boolean
          slug: string
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_flashcards: {
        Row: {
          answer: string
          approved: boolean
          chapter: string
          created_at: string
          created_by: string | null
          delete_requested_at: string | null
          delete_requested_by: string | null
          id: string
          language: string
          question: string
          subject: string
        }
        Insert: {
          answer: string
          approved?: boolean
          chapter: string
          created_at?: string
          created_by?: string | null
          delete_requested_at?: string | null
          delete_requested_by?: string | null
          id?: string
          language?: string
          question: string
          subject: string
        }
        Update: {
          answer?: string
          approved?: boolean
          chapter?: string
          created_at?: string
          created_by?: string | null
          delete_requested_at?: string | null
          delete_requested_by?: string | null
          id?: string
          language?: string
          question?: string
          subject?: string
        }
        Relationships: []
      }
      daily_games: {
        Row: {
          day: number
          engine: string
          month_key: string
          spec: Json
          subject: string
          updated_at: string
        }
        Insert: {
          day: number
          engine: string
          month_key: string
          spec?: Json
          subject: string
          updated_at?: string
        }
        Update: {
          day?: number
          engine?: string
          month_key?: string
          spec?: Json
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          ai_plan: Json | null
          ai_strengths: Json | null
          ai_summary: string | null
          ai_weaknesses: Json | null
          created_at: string
          focused_minutes: number
          id: string
          language: string
          missions_completed: number
          points_earned: number
          report_date: string
          sessions_count: number
          subjects_breakdown: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_plan?: Json | null
          ai_strengths?: Json | null
          ai_summary?: string | null
          ai_weaknesses?: Json | null
          created_at?: string
          focused_minutes?: number
          id?: string
          language?: string
          missions_completed?: number
          points_earned?: number
          report_date: string
          sessions_count?: number
          subjects_breakdown?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_plan?: Json | null
          ai_strengths?: Json | null
          ai_summary?: string | null
          ai_weaknesses?: Json | null
          created_at?: string
          focused_minutes?: number
          id?: string
          language?: string
          missions_completed?: number
          points_earned?: number
          report_date?: string
          sessions_count?: number
          subjects_breakdown?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      edge_rate_limits: {
        Row: {
          bucket_key: string
          feature: string
          id: number
          request_count: number
          window_start: string
        }
        Insert: {
          bucket_key: string
          feature: string
          id?: number
          request_count?: number
          window_start?: string
        }
        Update: {
          bucket_key?: string
          feature?: string
          id?: number
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      english_lecture_question_cache: {
        Row: {
          created_at: string
          notes_parts: Json
          source_hash: string
          teacher_id: string
          topic_key: string
        }
        Insert: {
          created_at?: string
          notes_parts: Json
          source_hash: string
          teacher_id: string
          topic_key: string
        }
        Update: {
          created_at?: string
          notes_parts?: Json
          source_hash?: string
          teacher_id?: string
          topic_key?: string
        }
        Relationships: []
      }
      english_reading_trials: {
        Row: {
          expires_at: string
          started_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          started_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      feature_announcements: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          desc_ar: string
          desc_en: string
          id: string
          kind: string
          link_url: string | null
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          desc_ar?: string
          desc_en?: string
          id?: string
          kind?: string
          link_url?: string | null
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          desc_ar?: string
          desc_en?: string
          id?: string
          kind?: string
          link_url?: string | null
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_unlocks: {
        Row: {
          created_at: string
          display_name_ar: string
          display_name_en: string
          feature_key: string
          icon: string
          sort_order: number
          unlock_threshold: number
        }
        Insert: {
          created_at?: string
          display_name_ar: string
          display_name_en: string
          feature_key: string
          icon?: string
          sort_order: number
          unlock_threshold: number
        }
        Update: {
          created_at?: string
          display_name_ar?: string
          display_name_en?: string
          feature_key?: string
          icon?: string
          sort_order?: number
          unlock_threshold?: number
        }
        Relationships: []
      }
      feature_usage: {
        Row: {
          created_at: string
          feature: string
          id: string
          used_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          used_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          used_on?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          answer: string
          card_key: string
          chapter: string
          created_at: string
          due_at: string
          ease: number
          id: string
          interval_days: number
          language: string
          lapses: number
          last_rating: string | null
          last_reviewed_at: string | null
          question: string
          reps: number
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          card_key: string
          chapter: string
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          language?: string
          lapses?: number
          last_rating?: string | null
          last_reviewed_at?: string | null
          question: string
          reps?: number
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          card_key?: string
          chapter?: string
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          language?: string
          lapses?: number
          last_rating?: string | null
          last_reviewed_at?: string | null
          question?: string
          reps?: number
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      french_flashcard_overrides: {
        Row: {
          answer: string
          card_index: number
          chapter: number
          created_at: string
          hidden: boolean
          id: string
          question: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer: string
          card_index: number
          chapter: number
          created_at?: string
          hidden?: boolean
          id?: string
          question: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer?: string
          card_index?: number
          chapter?: number
          created_at?: string
          hidden?: boolean
          id?: string
          question?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      french_flashcard_staff: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      inactivity_push_log: {
        Row: {
          batch_id: string
          claimed_at: string
          last_activity_at: string
          sent_at: string | null
          stage: string
          status: string
          user_id: string
        }
        Insert: {
          batch_id: string
          claimed_at?: string
          last_activity_at: string
          sent_at?: string | null
          stage: string
          status?: string
          user_id: string
        }
        Update: {
          batch_id?: string
          claimed_at?: string
          last_activity_at?: string
          sent_at?: string | null
          stage?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          created_at: string
          full_name: string
          id: string
          notified: boolean
          notify_error: string | null
          teacher_name: string
          telegram_username: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          notified?: boolean
          notify_error?: string | null
          teacher_name: string
          telegram_username: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          notified?: boolean
          notify_error?: string | null
          teacher_name?: string
          telegram_username?: string
          updated_at?: string
        }
        Relationships: []
      }
      literature_access_codes: {
        Row: {
          code_hash: string
          code_hint: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          label: string
          max_uses: number
          revoked: boolean
          uses: number
        }
        Insert: {
          code_hash: string
          code_hint?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label?: string
          max_uses: number
          revoked?: boolean
          uses?: number
        }
        Update: {
          code_hash?: string
          code_hint?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label?: string
          max_uses?: number
          revoked?: boolean
          uses?: number
        }
        Relationships: []
      }
      literature_code_attempts: {
        Row: {
          attempts: number
          user_id: string
          window_end: string
        }
        Insert: {
          attempts: number
          user_id: string
          window_end: string
        }
        Update: {
          attempts?: number
          user_id?: string
          window_end?: string
        }
        Relationships: []
      }
      literature_enrollments: {
        Row: {
          code_id: string
          created_at: string
          expires_at: string | null
          user_id: string
        }
        Insert: {
          code_id: string
          created_at?: string
          expires_at?: string | null
          user_id: string
        }
        Update: {
          code_id?: string
          created_at?: string
          expires_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "literature_enrollments_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "literature_access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      literature_exams: {
        Row: {
          chapter: string
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          is_published: boolean
          title: string
        }
        Insert: {
          chapter?: string
          created_at?: string
          created_by?: string | null
          file_path: string
          id?: string
          is_published?: boolean
          title: string
        }
        Update: {
          chapter?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          id?: string
          is_published?: boolean
          title?: string
        }
        Relationships: []
      }
      literature_mcq_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          score: number
          set_id: string
          total: number
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          score: number
          set_id: string
          total: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          score?: number
          set_id?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "literature_mcq_attempts_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "literature_mcq_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      literature_mcq_sets: {
        Row: {
          chapter: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          questions: Json
          requested_count: number
          source_name: string
          title: string
        }
        Insert: {
          chapter?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          questions: Json
          requested_count: number
          source_name: string
          title: string
        }
        Update: {
          chapter?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          questions?: Json
          requested_count?: number
          source_name?: string
          title?: string
        }
        Relationships: []
      }
      malazam: {
        Row: {
          cover_path: string
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          is_published: boolean
          library_section: string
          name: string
          sort_order: number
          subject: string
          topic: string
          updated_at: string
        }
        Insert: {
          cover_path: string
          created_at?: string
          created_by?: string | null
          file_path: string
          id?: string
          is_published?: boolean
          library_section?: string
          name: string
          sort_order?: number
          subject: string
          topic: string
          updated_at?: string
        }
        Update: {
          cover_path?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          id?: string
          is_published?: boolean
          library_section?: string
          name?: string
          sort_order?: number
          subject?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      malazam_downloads: {
        Row: {
          downloaded_at: string
          id: number
          malzama_id: string
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: number
          malzama_id: string
          user_id: string
        }
        Update: {
          downloaded_at?: string
          id?: number
          malzama_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "malazam_downloads_malzama_id_fkey"
            columns: ["malzama_id"]
            isOneToOne: false
            referencedRelation: "malazam"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_bank_review_attempts: {
        Row: {
          attempt_count: number
          first_attempt_at: string
          last_answer_correct: boolean
          last_attempt_at: string
          next_review_at: string | null
          question_id: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          first_attempt_at?: string
          last_answer_correct?: boolean
          last_attempt_at?: string
          next_review_at?: string | null
          question_id: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          first_attempt_at?: string
          last_answer_correct?: boolean
          last_attempt_at?: string
          next_review_at?: string | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcq_bank_review_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mcq_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_banks: {
        Row: {
          answer_index: number
          chapter: number
          chapter_title: string | null
          choices: Json
          created_at: string
          created_by: string | null
          difficulty: string
          explanation: string | null
          id: string
          language: string
          question: string
          section: string | null
          sort_order: number
          source: string | null
          subject: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          answer_index?: number
          chapter?: number
          chapter_title?: string | null
          choices?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          language?: string
          question: string
          section?: string | null
          sort_order?: number
          source?: string | null
          subject: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          answer_index?: number
          chapter?: number
          chapter_title?: string | null
          choices?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          id?: string
          language?: string
          question?: string
          section?: string | null
          sort_order?: number
          source?: string | null
          subject?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      mission_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          subject: string
          topic_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          subject: string
          topic_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          subject?: string
          topic_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      my_mistakes: {
        Row: {
          chapter: string | null
          choices: Json
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          language: string | null
          next_review_at: string
          question: string
          ref_id: string | null
          resolved: boolean
          source: string
          subject: string | null
          times_redone: number
          times_wrong: number
          updated_at: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          chapter?: string | null
          choices?: Json
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          language?: string | null
          next_review_at?: string
          question: string
          ref_id?: string | null
          resolved?: boolean
          source: string
          subject?: string | null
          times_redone?: number
          times_wrong?: number
          updated_at?: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          chapter?: string | null
          choices?: Json
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          language?: string | null
          next_review_at?: string
          question?: string
          ref_id?: string | null
          resolved?: boolean
          source?: string
          subject?: string | null
          times_redone?: number
          times_wrong?: number
          updated_at?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nadawi_contest_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          elapsed_ms: number | null
          id: string
          items: Json
          question_index: number
          question_started_at: string
          score: number
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          elapsed_ms?: number | null
          id?: string
          items: Json
          question_index?: number
          question_started_at: string
          score?: number
          started_at: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          elapsed_ms?: number | null
          id?: string
          items?: Json
          question_index?: number
          question_started_at?: string
          score?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nadawi_contest_questions: {
        Row: {
          id: string
          item: Json
        }
        Insert: {
          id: string
          item: Json
        }
        Update: {
          id?: string
          item?: Json
        }
        Relationships: []
      }
      nadawi_contest_test_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          elapsed_ms: number | null
          id: string
          items: Json
          question_index: number
          question_started_at: string
          score: number
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          elapsed_ms?: number | null
          id?: string
          items: Json
          question_index?: number
          question_started_at: string
          score?: number
          started_at: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          elapsed_ms?: number | null
          id?: string
          items?: Json
          question_index?: number
          question_started_at?: string
          score?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_path: string | null
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_path?: string | null
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_path?: string | null
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notebooks: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: Json
          created_at: string
          icon: string | null
          id: string
          notebook_id: string | null
          parent_id: string | null
          position: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          icon?: string | null
          id?: string
          notebook_id?: string | null
          parent_id?: string | null
          position?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          icon?: string | null
          id?: string
          notebook_id?: string | null
          parent_id?: string | null
          position?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          link: string | null
          link_updated_at: string | null
          push_sent: boolean
          telegram_sent: boolean
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          link_updated_at?: string | null
          push_sent?: boolean
          telegram_sent?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string | null
          link_updated_at?: string | null
          push_sent?: boolean
          telegram_sent?: boolean
          title?: string
        }
        Relationships: []
      }
      parent_follow_links: {
        Row: {
          access_code: string
          created_at: string
          enabled: boolean
          id: string
          parent_name: string | null
          revoked_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          access_code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          parent_name?: string | null
          revoked_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          parent_name?: string | null
          revoked_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_student_notes: {
        Row: {
          created_at: string
          id: string
          link_id: string
          note_text: string
          student_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id: string
          note_text: string
          student_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string
          note_text?: string
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_notes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "parent_follow_links"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student_score_balances: {
        Row: {
          created_at: string
          link_id: string
          score: number
          student_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          link_id: string
          score?: number
          student_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          link_id?: string
          score?: number
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_score_balances_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "parent_follow_links"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student_scores: {
        Row: {
          created_at: string
          id: string
          link_id: string
          max_score: number
          note: string | null
          score: number
          student_user_id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id: string
          max_score: number
          note?: string | null
          score: number
          student_user_id: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string
          max_score?: number
          note?: string | null
          score?: number
          student_user_id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_scores_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "parent_follow_links"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          environment: string
          event_id: string | null
          event_type: string
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          payload: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          environment?: string
          event_id?: string | null
          event_type: string
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          payload: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          environment?: string
          event_id?: string | null
          event_type?: string
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          payload?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      platform_teachers: {
        Row: {
          background_image_path: string
          background_image_url: string
          created_at: string
          created_by: string | null
          flashcard_list_ids: string[]
          id: string
          is_published: boolean
          name: string
          sort_order: number
          tools: string[]
          updated_at: string
        }
        Insert: {
          background_image_path: string
          background_image_url: string
          created_at?: string
          created_by?: string | null
          flashcard_list_ids?: string[]
          id?: string
          is_published?: boolean
          name: string
          sort_order?: number
          tools?: string[]
          updated_at?: string
        }
        Update: {
          background_image_path?: string
          background_image_url?: string
          created_at?: string
          created_by?: string | null
          flashcard_list_ids?: string[]
          id?: string
          is_published?: boolean
          name?: string
          sort_order?: number
          tools?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      player_lectures: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          sort_order: number
          subject: string | null
          title: string
          updated_at: string
          video_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          subject?: string | null
          title: string
          updated_at?: string
          video_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          sort_order?: number
          subject?: string | null
          title?: string
          updated_at?: string
          video_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      player_teachers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          playlist_id: string
          playlist_url: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          playlist_id: string
          playlist_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          playlist_id?: string
          playlist_url?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      podcast_segments: {
        Row: {
          answer_key: string
          checkpoint_prompt: string
          completed_at: string | null
          correction_audio_url: string | null
          correction_text: string | null
          created_at: string
          id: string
          narration_audio_url: string | null
          narration_text: string
          segment_order: number
          session_id: string
          student_answer_audio_url: string | null
          student_answer_text: string | null
          verdict: string | null
        }
        Insert: {
          answer_key: string
          checkpoint_prompt: string
          completed_at?: string | null
          correction_audio_url?: string | null
          correction_text?: string | null
          created_at?: string
          id?: string
          narration_audio_url?: string | null
          narration_text: string
          segment_order: number
          session_id: string
          student_answer_audio_url?: string | null
          student_answer_text?: string | null
          verdict?: string | null
        }
        Update: {
          answer_key?: string
          checkpoint_prompt?: string
          completed_at?: string | null
          correction_audio_url?: string | null
          correction_text?: string | null
          created_at?: string
          id?: string
          narration_audio_url?: string | null
          narration_text?: string
          segment_order?: number
          session_id?: string
          student_answer_audio_url?: string | null
          student_answer_text?: string | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_segments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "podcast_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          status: string
          subject: string | null
          title: string | null
          updated_at: string
          user_id: string
          voice_id: string
          youtube_url: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          voice_id: string
          youtube_url: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          voice_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      point_redemptions: {
        Row: {
          created_at: string
          id: string
          points_spent: number
          reward: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_spent: number
          reward: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_spent?: number
          reward?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_option_requests: {
        Row: {
          created_at: string
          guest_key: string | null
          id: string
          image_path: string | null
          label: string
          poll_id: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_key?: string | null
          id?: string
          image_path?: string | null
          label: string
          poll_id: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_key?: string | null
          id?: string
          image_path?: string | null
          label?: string
          poll_id?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_option_requests_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          created_by: string | null
          guest_key: string | null
          id: string
          image_path: string | null
          label: string
          poll_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          guest_key?: string | null
          id?: string
          image_path?: string | null
          label: string
          poll_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          guest_key?: string | null
          id?: string
          image_path?: string | null
          label?: string
          poll_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          guest_key: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_key?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_key?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      premium_promo_codes: {
        Row: {
          code: string
          created_at: string
          duration_amount: number | null
          duration_months: number | null
          duration_seconds: number | null
          duration_unit: string | null
          expires_at: string
          grants_full_access: boolean
          id: string
          is_active: boolean
          starts_at: string
        }
        Insert: {
          code: string
          created_at?: string
          duration_amount?: number | null
          duration_months?: number | null
          duration_seconds?: number | null
          duration_unit?: string | null
          expires_at: string
          grants_full_access?: boolean
          id: string
          is_active?: boolean
          starts_at: string
        }
        Update: {
          code?: string
          created_at?: string
          duration_amount?: number | null
          duration_months?: number | null
          duration_seconds?: number | null
          duration_unit?: string | null
          expires_at?: string
          grants_full_access?: boolean
          id?: string
          is_active?: boolean
          starts_at?: string
        }
        Relationships: []
      }
      premium_promo_redemptions: {
        Row: {
          campaign_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_promo_redemptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "premium_promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          character: Json | null
          created_at: string
          display_name: string
          gender: string | null
          id: string
          show_study_hours: boolean
          socials: Json
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          character?: Json | null
          created_at?: string
          display_name?: string
          gender?: string | null
          id?: string
          show_study_hours?: boolean
          socials?: Json
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          character?: Json | null
          created_at?: string
          display_name?: string
          gender?: string | null
          id?: string
          show_study_hours?: boolean
          socials?: Json
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      psych_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string | null
          token: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string | null
          token: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string | null
          token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      request_rate_limits: {
        Row: {
          feature: string
          id: string
          requested_at: string
          user_id: string
        }
        Insert: {
          feature: string
          id?: string
          requested_at?: string
          user_id: string
        }
        Update: {
          feature?: string
          id?: string
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_push_log: {
        Row: {
          batch_id: string
          claimed_at: string
          reminder_day: string
          reminder_type: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          batch_id: string
          claimed_at?: string
          reminder_day: string
          reminder_type: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          batch_id?: string
          claimed_at?: string
          reminder_day?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      science_sources: {
        Row: {
          academic_year: string
          book_edition: string | null
          book_title: string | null
          book_url: string | null
          chapter: string | null
          classification: string | null
          classification_url: string | null
          created_at: string
          created_by: string | null
          curriculum: string
          exams: Json
          excerpt: string
          id: string
          pdf_page: number | null
          printed_page: number | null
          question: string
          search_vector: unknown
          subject: string
          verified: boolean
        }
        Insert: {
          academic_year: string
          book_edition?: string | null
          book_title?: string | null
          book_url?: string | null
          chapter?: string | null
          classification?: string | null
          classification_url?: string | null
          created_at?: string
          created_by?: string | null
          curriculum: string
          exams?: Json
          excerpt: string
          id?: string
          pdf_page?: number | null
          printed_page?: number | null
          question: string
          search_vector?: unknown
          subject: string
          verified?: boolean
        }
        Update: {
          academic_year?: string
          book_edition?: string | null
          book_title?: string | null
          book_url?: string | null
          chapter?: string | null
          classification?: string | null
          classification_url?: string | null
          created_at?: string
          created_by?: string | null
          curriculum?: string
          exams?: Json
          excerpt?: string
          id?: string
          pdf_page?: number | null
          printed_page?: number | null
          question?: string
          search_vector?: unknown
          subject?: string
          verified?: boolean
        }
        Relationships: []
      }
      session_royale_answers: {
        Row: {
          choice: number
          correct: boolean
          question_index: number
          round_id: string
          user_id: string
        }
        Insert: {
          choice: number
          correct: boolean
          question_index: number
          round_id: string
          user_id: string
        }
        Update: {
          choice?: number
          correct?: boolean
          question_index?: number
          round_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_royale_answers_round_id_user_id_fkey"
            columns: ["round_id", "user_id"]
            isOneToOne: false
            referencedRelation: "session_royale_players"
            referencedColumns: ["round_id", "user_id"]
          },
        ]
      }
      session_royale_players: {
        Row: {
          name: string
          round_id: string
          user_id: string
        }
        Insert: {
          name: string
          round_id: string
          user_id: string
        }
        Update: {
          name?: string
          round_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_royale_players_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "session_royales"
            referencedColumns: ["id"]
          },
        ]
      }
      session_royale_votes: {
        Row: {
          cast_at: string
          chapter: number
          language: string
          round_id: string
          subject: string
          user_id: string
        }
        Insert: {
          cast_at?: string
          chapter: number
          language: string
          round_id: string
          subject: string
          user_id: string
        }
        Update: {
          cast_at?: string
          chapter?: number
          language?: string
          round_id?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_royale_votes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "session_royales"
            referencedColumns: ["id"]
          },
        ]
      }
      session_royales: {
        Row: {
          cancelled: boolean
          chapter: number | null
          expires_at: string
          host_id: string | null
          id: string
          language: string | null
          questions: Json
          slot: string | null
          starts_at: string | null
          subject: string | null
        }
        Insert: {
          cancelled?: boolean
          chapter?: number | null
          expires_at: string
          host_id?: string | null
          id?: string
          language?: string | null
          questions?: Json
          slot?: string | null
          starts_at?: string | null
          subject?: string | null
        }
        Update: {
          cancelled?: boolean
          chapter?: number | null
          expires_at?: string
          host_id?: string | null
          id?: string
          language?: string | null
          questions?: Json
          slot?: string | null
          starts_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      session_telegram_posts: {
        Row: {
          kind: string
          slot: string
          state: string
          telegram_message_id: string | null
        }
        Insert: {
          kind: string
          slot: string
          state?: string
          telegram_message_id?: string | null
        }
        Update: {
          kind?: string
          slot?: string
          state?: string
          telegram_message_id?: string | null
        }
        Relationships: []
      }
      signup_attribution: {
        Row: {
          code: string | null
          created_at: string
          id: string
          landing_path: string | null
          referrer: string | null
          src: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          landing_path?: string | null
          referrer?: string | null
          src?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          landing_path?: string | null
          referrer?: string | null
          src?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          count: number
          id: string
          updated_at: string
        }
        Insert: {
          count?: number
          id: string
          updated_at?: string
        }
        Update: {
          count?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profile: {
        Row: {
          created_at: string
          exam_date: string | null
          onboarded: boolean
          study_window: string | null
          target_grade: number | null
          track: string | null
          updated_at: string
          user_id: string
          weak_subjects: string[] | null
          weekly_goal_hours: number | null
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          onboarded?: boolean
          study_window?: string | null
          target_grade?: number | null
          track?: string | null
          updated_at?: string
          user_id: string
          weak_subjects?: string[] | null
          weekly_goal_hours?: number | null
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          onboarded?: boolean
          study_window?: string | null
          target_grade?: number | null
          track?: string | null
          updated_at?: string
          user_id?: string
          weak_subjects?: string[] | null
          weekly_goal_hours?: number | null
        }
        Relationships: []
      }
      student_todos: {
        Row: {
          items: Json
          updated_at: string
          user_id: string
          week_key: string | null
        }
        Insert: {
          items?: Json
          updated_at?: string
          user_id: string
          week_key?: string | null
        }
        Update: {
          items?: Json
          updated_at?: string
          user_id?: string
          week_key?: string | null
        }
        Relationships: []
      }
      student_weakness_sessions: {
        Row: {
          detected_areas: Json
          finished_at: string | null
          id: string
          iso_week: string
          messages: Json
          started_at: string
          status: string
          updated_at: string
          user_id: string
          weak_areas: Json
        }
        Insert: {
          detected_areas?: Json
          finished_at?: string | null
          id?: string
          iso_week: string
          messages?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          weak_areas?: Json
        }
        Update: {
          detected_areas?: Json
          finished_at?: string | null
          id?: string
          iso_week?: string
          messages?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          weak_areas?: Json
        }
        Relationships: []
      }
      study_challenge_members: {
        Row: {
          challenge_id: string
          created_at: string
          invited_by: string
          joined_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          invited_by: string
          joined_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          invited_by?: string
          joined_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_challenge_members_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "study_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      study_challenge_stakes: {
        Row: {
          challenge_id: string
          created_at: string
          points: number
          redemption_id: string | null
          settled_at: string | null
          state: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          points: number
          redemption_id?: string | null
          settled_at?: string | null
          state?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          points?: number
          redemption_id?: string | null
          settled_at?: string | null
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_challenge_stakes_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "study_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      study_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          creator_id: string
          duration_days: number
          duration_hours: number
          ends_at: string
          id: string
          is_public: boolean
          lobby_expires_at: string | null
          public_period_key: string | null
          public_series: string | null
          require_recorded_focus: boolean | null
          room_state: string
          settled_at: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          wager_points: number | null
          winner_id: string | null
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          creator_id: string
          duration_days?: number
          duration_hours?: number
          ends_at: string
          id?: string
          is_public?: boolean
          lobby_expires_at?: string | null
          public_period_key?: string | null
          public_series?: string | null
          require_recorded_focus?: boolean | null
          room_state?: string
          settled_at?: string | null
          starts_at?: string
          status?: string
          title: string
          updated_at?: string
          wager_points?: number | null
          winner_id?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string
          creator_id?: string
          duration_days?: number
          duration_hours?: number
          ends_at?: string
          id?: string
          is_public?: boolean
          lobby_expires_at?: string | null
          public_period_key?: string | null
          public_series?: string | null
          require_recorded_focus?: boolean | null
          room_state?: string
          settled_at?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          wager_points?: number | null
          winner_id?: string | null
        }
        Relationships: []
      }
      study_flight_breaks: {
        Row: {
          ends_at: string
          flight_id: string
          starts_at: string
        }
        Insert: {
          ends_at: string
          flight_id: string
          starts_at: string
        }
        Update: {
          ends_at?: string
          flight_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_flight_breaks_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "study_flights"
            referencedColumns: ["id"]
          },
        ]
      }
      study_flight_members: {
        Row: {
          accepted_at: string | null
          flight_id: string
          seat_number: number
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          flight_id: string
          seat_number: number
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          flight_id?: string
          seat_number?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_flight_members_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "study_flights"
            referencedColumns: ["id"]
          },
        ]
      }
      study_flight_routes: {
        Row: {
          destination_id: string
          plan: Json
        }
        Insert: {
          destination_id: string
          plan: Json
        }
        Update: {
          destination_id?: string
          plan?: Json
        }
        Relationships: []
      }
      study_flight_study_credits: {
        Row: {
          destination_id: string
          period: unknown
          session_id: string
          user_id: string
        }
        Insert: {
          destination_id: string
          period: unknown
          session_id?: string
          user_id: string
        }
        Update: {
          destination_id?: string
          period?: unknown
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_flight_study_credits_user_id_destination_id_fkey"
            columns: ["user_id", "destination_id"]
            isOneToOne: false
            referencedRelation: "study_flight_visits"
            referencedColumns: ["user_id", "destination_id"]
          },
        ]
      }
      study_flight_visits: {
        Row: {
          arrival_seen_at: string | null
          destination_id: string
          flight_id: string | null
          legacy_data: Json | null
          sold_at: string | null
          user_id: string
          visa_awarded_at: string | null
        }
        Insert: {
          arrival_seen_at?: string | null
          destination_id: string
          flight_id?: string | null
          legacy_data?: Json | null
          sold_at?: string | null
          user_id: string
          visa_awarded_at?: string | null
        }
        Update: {
          arrival_seen_at?: string | null
          destination_id?: string
          flight_id?: string | null
          legacy_data?: Json | null
          sold_at?: string | null
          user_id?: string
          visa_awarded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_flight_visits_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "study_flight_routes"
            referencedColumns: ["destination_id"]
          },
          {
            foreignKeyName: "study_flight_visits_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "study_flights"
            referencedColumns: ["id"]
          },
        ]
      }
      study_flights: {
        Row: {
          arrival_at: string
          destination_id: string
          id: string
          owner_id: string
          paused_at: string | null
          paused_ms: number
          plan: Json
          started_at: string
          study_legacy_paused_ms: number
        }
        Insert: {
          arrival_at: string
          destination_id: string
          id?: string
          owner_id: string
          paused_at?: string | null
          paused_ms?: number
          plan: Json
          started_at?: string
          study_legacy_paused_ms?: number
        }
        Update: {
          arrival_at?: string
          destination_id?: string
          id?: string
          owner_id?: string
          paused_at?: string | null
          paused_ms?: number
          plan?: Json
          started_at?: string
          study_legacy_paused_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_flights_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "study_flight_routes"
            referencedColumns: ["destination_id"]
          },
        ]
      }
      study_room_bans: {
        Row: {
          banned_by: string
          created_at: string
          display_name: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          display_name?: string | null
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          display_name?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_bans_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_room_encouragements: {
        Row: {
          created_at: string
          recipient_id: string
          reward_points: number
          room_id: string
          seen_at: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          recipient_id: string
          reward_points?: number
          room_id: string
          seen_at?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          created_at?: string
          recipient_id?: string
          reward_points?: number
          room_id?: string
          seen_at?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_encouragements_room_id_recipient_id_fkey"
            columns: ["room_id", "recipient_id"]
            isOneToOne: false
            referencedRelation: "study_room_members"
            referencedColumns: ["room_id", "user_id"]
          },
        ]
      }
      study_room_members: {
        Row: {
          display_name: string
          id: string
          joined_at: string
          last_seen_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          display_name?: string
          id?: string
          joined_at?: string
          last_seen_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          joined_at?: string
          last_seen_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_room_messages: {
        Row: {
          body: string
          created_at: string
          display_name: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          display_name?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          display_name?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "study_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      study_room_mic_requests: {
        Row: {
          connection_id: string | null
          live_until: string | null
          room_id: string
          state: string
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          live_until?: string | null
          room_id: string
          state: string
          user_id: string
        }
        Update: {
          connection_id?: string | null
          live_until?: string | null
          room_id?: string
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_room_mic_requests_room_id_user_id_fkey"
            columns: ["room_id", "user_id"]
            isOneToOne: true
            referencedRelation: "study_room_members"
            referencedColumns: ["room_id", "user_id"]
          },
        ]
      }
      study_rooms: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_public: boolean
          name: string
          owner_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_public?: boolean
          name: string
          owner_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_public?: boolean
          name?: string
          owner_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_seconds: number
          flight_credit_id: string | null
          id: string
          mission: string
          mission_completed: boolean
          points: number
          study_periods: unknown
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          flight_credit_id?: string | null
          id?: string
          mission: string
          mission_completed?: boolean
          points?: number
          study_periods?: unknown
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          flight_credit_id?: string | null
          id?: string
          mission?: string
          mission_completed?: boolean
          points?: number
          study_periods?: unknown
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_flight_credit_id_fkey"
            columns: ["flight_credit_id"]
            isOneToOne: true
            referencedRelation: "study_flight_study_credits"
            referencedColumns: ["session_id"]
          },
        ]
      }
      study_timer_focus: {
        Row: {
          periods: unknown
          session_id: string
        }
        Insert: {
          periods: unknown
          session_id: string
        }
        Update: {
          periods?: unknown
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_timer_focus_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_file_text: {
        Row: {
          chapter: string
          char_count: number
          file_name: string
          id: string
          subject: string
          text: string
          updated_at: string
        }
        Insert: {
          chapter?: string
          char_count?: number
          file_name: string
          id?: string
          subject: string
          text?: string
          updated_at?: string
        }
        Update: {
          chapter?: string
          char_count?: number
          file_name?: string
          id?: string
          subject?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          approved: boolean
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          id: string
          mime_type: string | null
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number
          id?: string
          mime_type?: string | null
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      summary_likes: {
        Row: {
          created_at: string
          id: string
          summary_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          summary_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          summary_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_likes_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_mcq_pending_changes: {
        Row: {
          action: string
          created_at: string
          id: string
          new_question: Json | null
          question_index: number | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          teacher_id: string
          topic_key: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_question?: Json | null
          question_index?: number | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          teacher_id: string
          topic_key: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_question?: Json | null
          question_index?: number | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          teacher_id?: string
          topic_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_topic_mcqs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          questions: Json
          teacher_id: string
          title: string
          topic_key: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          questions: Json
          teacher_id: string
          title?: string
          topic_key: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          questions?: Json
          teacher_id?: string
          title?: string
          topic_key?: string
        }
        Relationships: []
      }
      teacher_topic_videos: {
        Row: {
          approved: boolean
          created_at: string
          created_by: string | null
          id: string
          notes_parts: Json
          teacher_id: string
          title: string | null
          topic_key: string
          transcript: string | null
          updated_at: string
          video_id: string | null
          youtube_url: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          notes_parts?: Json
          teacher_id: string
          title?: string | null
          topic_key: string
          transcript?: string | null
          updated_at?: string
          video_id?: string | null
          youtube_url: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          notes_parts?: Json
          teacher_id?: string
          title?: string | null
          topic_key?: string
          transcript?: string | null
          updated_at?: string
          video_id?: string | null
          youtube_url?: string
        }
        Relationships: []
      }
      telegram_notifications_sent: {
        Row: {
          id: string
          message_id: number | null
          notification_key: string
          sent_at: string
          telegram_user_id: number
        }
        Insert: {
          id?: string
          message_id?: number | null
          notification_key: string
          sent_at?: string
          telegram_user_id: number
        }
        Update: {
          id?: string
          message_id?: number | null
          notification_key?: string
          sent_at?: string
          telegram_user_id?: number
        }
        Relationships: []
      }
      telegram_verifications: {
        Row: {
          connected_at: string | null
          connection_source: string | null
          created_at: string
          last_checked_at: string | null
          last_error: string | null
          telegram_user_id: number | null
          telegram_username: string | null
          token: string
          token_expires_at: string | null
          token_used_at: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          connected_at?: string | null
          connection_source?: string | null
          created_at?: string
          last_checked_at?: string | null
          last_error?: string | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          token: string
          token_expires_at?: string | null
          token_used_at?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          connected_at?: string | null
          connection_source?: string | null
          created_at?: string
          last_checked_at?: string | null
          last_error?: string | null
          telegram_user_id?: number | null
          telegram_username?: string | null
          token?: string
          token_expires_at?: string | null
          token_used_at?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      topic_practice_attempts: {
        Row: {
          category_key: string
          chapter: string
          correct: boolean
          created_at: string
          id: string
          question_key: string
          question_text: string | null
          source: string
          subject: string
          user_id: string
        }
        Insert: {
          category_key: string
          chapter: string
          correct: boolean
          created_at?: string
          id?: string
          question_key: string
          question_text?: string | null
          source: string
          subject: string
          user_id: string
        }
        Update: {
          category_key?: string
          chapter?: string
          correct?: boolean
          created_at?: string
          id?: string
          question_key?: string
          question_text?: string | null
          source?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_journeys: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          props: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          props?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          props?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_feature_unlocks: {
        Row: {
          celebrated: boolean
          feature_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          celebrated?: boolean
          feature_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          celebrated?: boolean
          feature_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_unlocks_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "feature_unlocks"
            referencedColumns: ["feature_key"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          points: number
          ref_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          ref_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          ref_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_streak: number
          last_active_date: string | null
          lifetime_points: number
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          lifetime_points?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          last_active_date?: string | null
          lifetime_points?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      username_requests: {
        Row: {
          created_at: string
          current_name: string | null
          id: string
          requested_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_name?: string | null
          id?: string
          requested_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_name?: string | null
          id?: string
          requested_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_notes_cache: {
        Row: {
          cache_key: string
          created_at: string
          notes: string
          parts: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          notes: string
          parts?: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          notes?: string
          parts?: Json
        }
        Relationships: []
      }
      weekly_learning_profiles: {
        Row: {
          chapter_key: string
          chapter_number: number
          created_at: string
          id: string
          iso_week: string
          plan_tasks: Json
          subject: string
          topic_ar: string
          topic_en: string
          topic_key: string
          updated_at: string
          user_id: string
          weak_areas: Json
          weakness_text: string
        }
        Insert: {
          chapter_key: string
          chapter_number: number
          created_at?: string
          id?: string
          iso_week: string
          plan_tasks?: Json
          subject: string
          topic_ar: string
          topic_en: string
          topic_key: string
          updated_at?: string
          user_id: string
          weak_areas?: Json
          weakness_text: string
        }
        Update: {
          chapter_key?: string
          chapter_number?: number
          created_at?: string
          id?: string
          iso_week?: string
          plan_tasks?: Json
          subject?: string
          topic_ar?: string
          topic_en?: string
          topic_key?: string
          updated_at?: string
          user_id?: string
          weak_areas?: Json
          weakness_text?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _channel_battle_payload: {
        Args: { a: Database["public"]["Tables"]["channel_battles"]["Row"] }
        Returns: Json
      }
      _nadawi_admin_contest_step: {
        Args: {
          _accept?: boolean
          _answer?: string
          _id: string
          _index?: number
        }
        Returns: Json
      }
      _nadawi_contest_step: {
        Args: {
          _accept?: boolean
          _answer?: string
          _id: string
          _index?: number
        }
        Returns: Json
      }
      _royale_bank: {
        Args: { _chapter: number; _language: string; _subject: string }
        Returns: Json
      }
      _royale_finalize: { Args: { _slot: string }; Returns: string }
      _royale_slot: { Args: { _at: string }; Returns: string }
      _royale_study_member: { Args: { _user: string }; Returns: boolean }
      adjust_parent_student_score: {
        Args: { _delta: number; _link_id: string; _student_user_id: string }
        Returns: number
      }
      admin_analytics_dropoff: { Args: never; Returns: Json }
      admin_analytics_engagement: { Args: never; Returns: Json }
      admin_analytics_features: {
        Args: { _days?: number }
        Returns: {
          feature: string
          users: number
          uses: number
        }[]
      }
      admin_analytics_overview: { Args: never; Returns: Json }
      admin_analytics_search_users: {
        Args: { _q: string }
        Returns: {
          display_name: string
          email: string
          last_seen: string
          points: number
          signed_up: string
          source: string
          user_id: string
        }[]
      }
      admin_analytics_signups: {
        Args: { _days?: number }
        Returns: {
          day: string
          direct: number
          instagram: number
          other: number
          referral: number
          telegram: number
          total: number
        }[]
      }
      admin_analytics_sources: {
        Args: never
        Returns: {
          source: string
          users: number
        }[]
      }
      admin_analytics_user_timeline: {
        Args: { _limit?: number; _user_id: string }
        Returns: {
          at: string
          detail: string
          kind: string
          label: string
        }[]
      }
      admin_common_mistakes: { Args: { _limit?: number }; Returns: Json }
      admin_grant_points: {
        Args: { _points: number; _reason?: string; _user_id: string }
        Returns: Json
      }
      admin_points_overview: { Args: { _limit?: number }; Returns: Json }
      admin_points_user_detail: {
        Args: { _limit?: number; _user_id: string }
        Returns: Json
      }
      admin_premium_coupons: {
        Args: {
          _action: string
          _active?: boolean
          _amount?: number
          _code?: string
          _id?: string
          _unit?: string
        }
        Returns: Json
      }
      answer_mcq_bank: {
        Args: { _choice_index: number; _question_id: string }
        Returns: Json
      }
      answer_race_question: {
        Args: {
          _attempt_id: string
          _chapter: number
          _choice: string
          _language: string
          _question: string
          _question_id: string
          _subject: string
        }
        Returns: Json
      }
      award_points: {
        Args: { _action_type: string; _metadata?: Json }
        Returns: Json
      }
      award_points_safe: {
        Args: { _points: number; _ref_id?: string; _source: string }
        Returns: string
      }
      can_take_study_room_ownership: { Args: never; Returns: boolean }
      can_use_premium_tools: { Args: never; Returns: boolean }
      cancel_study_challenge: {
        Args: { _challenge_id: string }
        Returns: undefined
      }
      character_unlock_status: { Args: never; Returns: Json }
      check_edge_rate_limit: {
        Args: {
          _feature: string
          _key: string
          _max_requests?: number
          _window_seconds?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _feature: string
          _max_requests?: number
          _window_seconds?: number
        }
        Returns: boolean
      }
      claim_channel_battle: { Args: { _id: string }; Returns: Json }
      claim_daily_feature: { Args: { _feature: string }; Returns: boolean }
      claim_daily_feature_limit: {
        Args: { _feature: string; _limit?: number }
        Returns: boolean
      }
      claim_english_reading_access: { Args: never; Returns: Json }
      claim_inactive_push_recipients_stage: {
        Args: { _batch_id: string; _limit?: number; _stage: string }
        Returns: {
          user_id: string
        }[]
      }
      claim_scheduled_study_reminders: {
        Args: { _batch_id: string; _limit?: number }
        Returns: {
          due_count: number
          reminder_type: string
          study_seconds: number
          user_id: string
        }[]
      }
      claim_study_today_push: {
        Args: { _batch_id: string; _limit?: number }
        Returns: {
          user_id: string
        }[]
      }
      cleanup_inactive_study_room_members: { Args: never; Returns: number }
      close_channel_battle: {
        Args: { _id: string; _started?: boolean }
        Returns: Json
      }
      community_chat_reaction_summary: {
        Args: { _post_id: string }
        Returns: {
          dislike_count: number
          like_count: number
          viewer_reaction: string
        }[]
      }
      coupon_access_end: {
        Args: { _amount: number; _start: string; _unit: string }
        Returns: string
      }
      create_all_or_nothing_challenge: {
        Args: {
          _duration_days: number
          _duration_hours: number
          _invitee_ids: string[]
          _title: string
          _wager_points: number
        }
        Returns: string
      }
      create_channel_battle: {
        Args: {
          _chapter: number
          _id: string
          _language: string
          _question_count: number
          _subject: string
        }
        Returns: Json
      }
      create_literature_codes: {
        Args: {
          code_label?: string
          expiry?: string
          quantity?: number
          use_limit?: number
        }
        Returns: Json
      }
      create_study_challenge: {
        Args: { _duration_days: number; _invitee_ids: string[]; _title: string }
        Returns: string
      }
      create_study_challenge_v2: {
        Args: {
          _challenge_type?: string
          _duration_days: number
          _invitee_ids: string[]
          _title: string
        }
        Returns: string
      }
      create_study_challenge_v3: {
        Args: {
          _challenge_type?: string
          _duration_days: number
          _invitee_ids: string[]
          _title: string
          _wager_points?: number
        }
        Returns: string
      }
      create_study_royale: {
        Args: {
          _chapter: number
          _invitees: string[]
          _language: string
          _questions: Json
          _subject: string
        }
        Returns: string
      }
      dismiss_study_room_encouragements: {
        Args: { _room: string; _through: string }
        Returns: undefined
      }
      encourage_study_room_member: {
        Args: { _recipient: string; _room: string }
        Returns: undefined
      }
      ensure_tamayzak_public_challenges: { Args: never; Returns: undefined }
      feature_usage_today: { Args: { _feature: string }; Returns: number }
      french_flashcard_access: { Args: never; Returns: Json }
      get_battle_channel_config: { Args: never; Returns: Json }
      get_channel_battle: {
        Args: { _heartbeat?: boolean; _id: string }
        Returns: Json
      }
      get_due_mcq_bank_reviews: {
        Args: never
        Returns: {
          question_id: string
        }[]
      }
      get_exam_answer_path: { Args: { _exam_id: string }; Returns: string }
      get_home_dashboard_stats: { Args: never; Returns: Json }
      get_literature_mcq_set: { Args: { set_id: string }; Returns: Json }
      get_my_referral_code: { Args: never; Returns: string }
      get_my_study_challenges: { Args: never; Returns: Json }
      get_nadawi_admin_test_state: { Args: never; Returns: Json }
      get_nadawi_contest_leaderboard: {
        Args: never
        Returns: {
          display_name: string
          elapsed_ms: number
          is_me: boolean
          rank: number
          score: number
        }[]
      }
      get_nadawi_contest_mistakes: {
        Args: { _admin_test?: boolean }
        Returns: Json
      }
      get_nadawi_contest_state: { Args: never; Returns: Json }
      has_active_premium: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_full_access_promo: { Args: never; Returns: boolean }
      has_literature_access: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_site_visits: { Args: never; Returns: number }
      is_banned_from_room: { Args: { _room: string }; Returns: boolean }
      is_course_enrolled: { Args: { _course: string }; Returns: boolean }
      is_course_student: { Args: never; Returns: boolean }
      is_course_teacher: { Args: { _course: string }; Returns: boolean }
      is_french_flashcard_owner: { Args: never; Returns: boolean }
      is_french_flashcard_staff: { Args: never; Returns: boolean }
      is_literature_supervisor: { Args: never; Returns: boolean }
      is_study_room_member: { Args: { _room: string }; Returns: boolean }
      is_study_room_owner: { Args: { _room: string }; Returns: boolean }
      leave_all_or_nothing_challenge: {
        Args: { _challenge_id: string }
        Returns: undefined
      }
      list_community_chat_comments: {
        Args: { _before_at?: string; _before_id?: string; _post_id: string }
        Returns: {
          author_id: string
          author_name: string
          body: string
          created_at: string
          id: string
        }[]
      }
      list_community_chat_posts: {
        Args: { _before_at?: string; _before_id?: string }
        Returns: {
          author_id: string
          author_name: string
          body: string
          comment_count: number
          created_at: string
          id: string
        }[]
      }
      list_community_chat_posts_v2: {
        Args: { _before_at?: string; _before_id?: string }
        Returns: {
          author_id: string
          author_name: string
          body: string
          comment_count: number
          created_at: string
          dislike_count: number
          id: string
          like_count: number
          photo_paths: string[]
          viewer_reaction: string
        }[]
      }
      list_literature_mcq_sets: { Args: never; Returns: Json }
      list_subject_chapters: {
        Args: { _subject: string }
        Returns: {
          chapter: string
          has_files: boolean
        }[]
      }
      literature_course_access: { Args: never; Returns: Json }
      manage_french_flashcard_staff: {
        Args: { action?: string; staff_email?: string }
        Returns: {
          created_at: string
          email: string
        }[]
        SetofOptions: {
          from: "*"
          to: "french_flashcard_staff"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      my_poll_vote: {
        Args: { _guest_key?: string; _poll_id: string }
        Returns: string
      }
      my_referral_stats: { Args: never; Returns: Json }
      points_balance: { Args: never; Returns: number }
      poll_vote_counts: {
        Args: { _poll_id: string }
        Returns: {
          option_id: string
          votes: number
        }[]
      }
      premium_access_status: { Args: never; Returns: Json }
      public_student_profile: { Args: { _user_id: string }; Returns: Json }
      record_mistake: {
        Args: {
          _chapter?: string
          _choices?: Json
          _correct_answer?: string
          _explanation?: string
          _language?: string
          _question: string
          _ref_id?: string
          _source: string
          _subject?: string
          _user_answer?: string
        }
        Returns: string
      }
      redeem_character_code: { Args: { access_code: string }; Returns: Json }
      redeem_literature_code: { Args: { access_code: string }; Returns: Json }
      redeem_premium_promo: { Args: { _code: string }; Returns: Json }
      redeem_premium_with_points: {
        Args: { _environment?: string; _request_id?: string }
        Returns: Json
      }
      redeem_referral: { Args: { _code: string }; Returns: Json }
      refund_all_or_nothing_stake: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: undefined
      }
      register_push_token: {
        Args: { _platform?: string; _token: string; _user_agent?: string }
        Returns: undefined
      }
      reserve_all_or_nothing_stake: {
        Args: { _challenge_id: string; _points: number; _user_id: string }
        Returns: number
      }
      resolve_mistake: {
        Args: { _correct: boolean; _id: string }
        Returns: undefined
      }
      respond_study_challenge: {
        Args: { _accept: boolean; _challenge_id: string }
        Returns: undefined
      }
      revoke_literature_code: { Args: { code_id: string }; Returns: undefined }
      save_study_timer_session: {
        Args: {
          _duration_seconds: number
          _mission: string
          _mission_completed: boolean
          _periods: unknown
          _session_id: string
          _subject: string
        }
        Returns: string
      }
      search_science_sources: {
        Args: {
          curriculum_key: string
          question_text: string
          school_year: string
        }
        Returns: {
          academic_year: string
          book_edition: string | null
          book_title: string | null
          book_url: string | null
          chapter: string | null
          classification: string | null
          classification_url: string | null
          created_at: string
          created_by: string | null
          curriculum: string
          exams: Json
          excerpt: string
          id: string
          pdf_page: number | null
          printed_page: number | null
          question: string
          search_vector: unknown
          subject: string
          verified: boolean
        }[]
        SetofOptions: {
          from: "*"
          to: "science_sources"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      session_royale_poll: { Args: { _vote?: Json }; Returns: Json }
      set_community_chat_reaction: {
        Args: { _post_id: string; _reaction: string }
        Returns: {
          dislike_count: number
          like_count: number
          viewer_reaction: string
        }[]
      }
      set_site_visits: { Args: { _count: number }; Returns: number }
      set_study_room_mic: {
        Args: {
          _action: string
          _connection?: string
          _requester?: string
          _room: string
        }
        Returns: undefined
      }
      settle_due_all_or_nothing_challenges: { Args: never; Returns: number }
      signal_study_room_voice: {
        Args: {
          _attempt: string
          _connection: string
          _description: Json
          _room: string
          _target: string
        }
        Returns: undefined
      }
      start_all_or_nothing_challenge: {
        Args: { _challenge_id: string }
        Returns: Json
      }
      start_nadawi_admin_test: { Args: { _restart?: boolean }; Returns: Json }
      start_nadawi_contest: { Args: never; Returns: Json }
      study_challenge_totals: {
        Args: { _challenge_id: string }
        Returns: {
          total_seconds: number
          user_id: string
        }[]
      }
      study_flight_inbox_internal: { Args: { _uid: string }; Returns: Json }
      study_flight_periods_internal: {
        Args: { _destination: string; _uid: string }
        Returns: unknown
      }
      study_flight_snapshot_internal: { Args: { _uid: string }; Returns: Json }
      study_flights_action: {
        Args: {
          _accept?: boolean
          _action: string
          _destination_id?: string
          _flight_id?: string
          _invitee_id?: string
        }
        Returns: Json
      }
      study_flights_action_v1: {
        Args: {
          _accept?: boolean
          _action: string
          _destination_id?: string
          _flight_id?: string
          _invitee_id?: string
        }
        Returns: Json
      }
      study_room_activity: { Args: { _room: string }; Returns: Json }
      study_room_voice_ice: { Args: { _room: string }; Returns: Json }
      study_royale: {
        Args: {
          _action?: string
          _choice?: number
          _id: string
          _index?: number
        }
        Returns: Json
      }
      submit_literature_mcq: {
        Args: { selections: Json; set_id: string }
        Returns: Json
      }
      submit_nadawi_admin_test_answer: {
        Args: { _answer?: string; _attempt_id: string; _question_index: number }
        Returns: Json
      }
      submit_nadawi_contest_answer: {
        Args: { _answer?: string; _attempt_id: string; _question_index: number }
        Returns: Json
      }
      sync_my_study_flights: { Args: never; Returns: Json }
      sync_study_flight_account_internal: {
        Args: { _uid: string }
        Returns: Json
      }
      take_study_room_ownership: { Args: { _room: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
