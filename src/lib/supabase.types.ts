// Auto-generated stub. Replace with `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase.types.ts`
// once Supabase project is provisioned + migration 0001_init.sql is applied.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          email: string
          company: string | null
          domain: string | null
          source: string | null
          utm: Json | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          company?: string | null
          domain?: string | null
          source?: string | null
          utm?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
        Relationships: []
      }
      dossiers: {
        Row: {
          id: string
          slug: string
          lead_id: string | null
          domain: string
          company_name: string | null
          industry: string | null
          input: Json
          xray: Json | null
          analysis: Json | null
          opportunities: Json | null
          competitors: Json | null
          model: string | null
          status: 'pending' | 'streaming' | 'complete' | 'error'
          error: string | null
          email_sent_at: string | null
          shared_count: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          lead_id?: string | null
          domain: string
          company_name?: string | null
          industry?: string | null
          input: Json
          xray?: Json | null
          analysis?: Json | null
          opportunities?: Json | null
          competitors?: Json | null
          model?: string | null
          status?: 'pending' | 'streaming' | 'complete' | 'error'
          error?: string | null
          email_sent_at?: string | null
          shared_count?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['dossiers']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'dossiers_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          lead_id: string | null
          channel: 'concierge' | 'voice' | 'boardroom'
          messages: Json
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          channel: 'concierge' | 'voice' | 'boardroom'
          messages: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
        Relationships: []
      }
      agent_runs: {
        Row: {
          id: string
          lead_id: string | null
          dossier_id: string | null
          agent_slug: string
          input: Json
          output: Json | null
          status: 'queued' | 'running' | 'success' | 'error'
          duration_ms: number | null
          tokens_in: number | null
          tokens_out: number | null
          cost_cents: number | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          dossier_id?: string | null
          agent_slug: string
          input: Json
          output?: Json | null
          status?: 'queued' | 'running' | 'success' | 'error'
          duration_ms?: number | null
          tokens_in?: number | null
          tokens_out?: number | null
          cost_cents?: number | null
          error?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['agent_runs']['Insert']>
        Relationships: []
      }
      scopes: {
        Row: {
          id: string
          lead_id: string | null
          dossier_id: string | null
          line_items: Json
          subtotal_cents: number
          total_cents: number
          stripe_session_id: string | null
          sow_pandadoc_id: string | null
          status: 'draft' | 'sent' | 'signed' | 'paid' | 'kicked_off'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          dossier_id?: string | null
          line_items: Json
          subtotal_cents: number
          total_cents: number
          stripe_session_id?: string | null
          sow_pandadoc_id?: string | null
          status?: 'draft' | 'sent' | 'signed' | 'paid' | 'kicked_off'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['scopes']['Insert']>
        Relationships: []
      }
      builds: {
        Row: {
          id: string
          slug: string
          client_name: string
          public: boolean
          repo_url: string | null
          deploy_url: string | null
          status: 'planning' | 'in_progress' | 'shipped'
          metrics: Json | null
          started_at: string
          shipped_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          client_name: string
          public?: boolean
          repo_url?: string | null
          deploy_url?: string | null
          status?: 'planning' | 'in_progress' | 'shipped'
          metrics?: Json | null
          started_at?: string
          shipped_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['builds']['Insert']>
        Relationships: []
      }
      generated_apps: {
        Row: {
          id: string
          lead_id: string | null
          prompt: string
          app_name: string | null
          summary: string | null
          files: Json
          repo_url: string | null
          deploy_url: string | null
          status: 'queued' | 'building' | 'ready' | 'failed'
          error: string | null
          created_at: string
          ready_at: string | null
        }
        Insert: {
          id?: string
          lead_id?: string | null
          prompt: string
          app_name?: string | null
          summary?: string | null
          files?: Json
          repo_url?: string | null
          deploy_url?: string | null
          status?: 'queued' | 'building' | 'ready' | 'failed'
          error?: string | null
          created_at?: string
          ready_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['generated_apps']['Insert']>
        Relationships: []
      }
      intake_sessions: {
        Row: {
          id: string
          lead_id: string | null
          email: string | null
          messages: Json
          insights: Json
          synopsis: Json | null
          app_id: string | null
          prototype_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          email?: string | null
          messages?: Json
          insights?: Json
          synopsis?: Json | null
          app_id?: string | null
          prototype_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['intake_sessions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'intake_sessions_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      digital_employees: {
        Row: {
          id: string
          lead_id: string | null
          name: string
          role: string
          task_brief: string
          slack_team_id: string | null
          status: 'provisioning' | 'active' | 'expired' | 'converted' | 'cancelled'
          trial_started_at: string
          trial_ends_at: string
          converted_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          lead_id?: string | null
          name: string
          role: string
          task_brief: string
          slack_team_id?: string | null
          status?: 'provisioning' | 'active' | 'expired' | 'converted' | 'cancelled'
          trial_started_at?: string
          trial_ends_at?: string
          converted_at?: string | null
          metadata?: Json | null
        }
        Update: Partial<Database['public']['Tables']['digital_employees']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
