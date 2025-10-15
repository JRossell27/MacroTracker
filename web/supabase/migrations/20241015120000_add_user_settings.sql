create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  calories_goal integer,
  protein_goal integer,
  carbs_goal integer,
  fat_goal integer,
  basal_calories integer,
  active_calories integer,
  hydration_target_oz integer,
  weight_lbs numeric,
  bmr_weight_lbs numeric,
  bmr_height_inches integer,
  bmr_age integer,
  bmr_sex text check (bmr_sex in ('male', 'female')),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create or replace function public.set_user_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row
execute function public.set_user_settings_updated_at();
