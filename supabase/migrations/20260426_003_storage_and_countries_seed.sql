-- Storage buckets + countries seed data
-- countries 視為相對穩定的字典資料，直接用 migration 管理。

-- ============================================================================
-- 1. Storage buckets
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "storage_public_read" on storage.objects;
create policy "storage_public_read"
  on storage.objects
  for select
  using (bucket_id in ('avatars', 'post-images'));

drop policy if exists "storage_authenticated_insert" on storage.objects;
create policy "storage_authenticated_insert"
  on storage.objects
  for insert
  with check (
    auth.role() = 'authenticated'
    and bucket_id in ('avatars', 'post-images')
  );

drop policy if exists "storage_owner_update" on storage.objects;
create policy "storage_owner_update"
  on storage.objects
  for update
  using (auth.uid()::text = owner::text)
  with check (auth.uid()::text = owner::text);

drop policy if exists "storage_owner_delete" on storage.objects;
create policy "storage_owner_delete"
  on storage.objects
  for delete
  using (auth.uid()::text = owner::text);

-- ============================================================================
-- 2. Countries seed
-- ============================================================================

insert into public.countries (slug, name_zh, name_en, flag_emoji, visa_info)
values
  ('australia', '澳洲', 'Australia', '🇦🇺', jsonb_build_object('overview', '澳洲是台灣最熱門的打工度假目的地之一。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('new-zealand', '紐西蘭', 'New Zealand', '🇳🇿', jsonb_build_object('overview', '紐西蘭適合偏好自然與慢節奏生活的人。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('japan', '日本', 'Japan', '🇯🇵', jsonb_build_object('overview', '日本重視語言與生活習慣適應。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('korea', '韓國', 'South Korea', '🇰🇷', jsonb_build_object('overview', '韓國適合想嘗試都會型工作與語言沉浸的人。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('canada', '加拿大', 'Canada', '🇨🇦', jsonb_build_object('overview', '加拿大多數人會同時準備工作與長期居留節奏。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('uk', '英國', 'United Kingdom', '🇬🇧', jsonb_build_object('overview', '英國常見問題是城市選擇與生活成本。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '24 個月', 'estimatedBudget', '15-20 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('ireland', '愛爾蘭', 'Ireland', '🇮🇪', jsonb_build_object('overview', '愛爾蘭適合初次前往歐洲的人。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('france', '法國', 'France', '🇫🇷', jsonb_build_object('overview', '法國需提早留意住宿與語言門檻。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('germany', '德國', 'Germany', '🇩🇪', jsonb_build_object('overview', '德國適合規劃型出發者，文件完整度很重要。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('belgium', '比利時', 'Belgium', '🇧🇪', jsonb_build_object('overview', '比利時資訊相對分散，整理模板更有價值。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('netherlands', '荷蘭', 'Netherlands', '🇳🇱', jsonb_build_object('overview', '荷蘭常見問題是住宿成本與城市選擇。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('luxembourg', '盧森堡', 'Luxembourg', '🇱🇺', jsonb_build_object('overview', '盧森堡適合想前往歐陸小國工作的申請者。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('austria', '奧地利', 'Austria', '🇦🇹', jsonb_build_object('overview', '奧地利適合偏好中歐節奏與生活品質的人。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('czechia', '捷克', 'Czechia', '🇨🇿', jsonb_build_object('overview', '捷克常見問題是住宿與語言落差。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('slovakia', '斯洛伐克', 'Slovakia', '🇸🇰', jsonb_build_object('overview', '斯洛伐克資料較少，社群互助尤其重要。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('hungary', '匈牙利', 'Hungary', '🇭🇺', jsonb_build_object('overview', '匈牙利適合偏好較低生活成本的歐洲城市。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('poland', '波蘭', 'Poland', '🇵🇱', jsonb_build_object('overview', '波蘭適合想從中東歐開始建立海外生活經驗的人。', 'ageRange', '18-30 歲', 'quota', '依年度公告', 'stayDuration', '12 個月', 'estimatedBudget', '12-18 萬台幣', 'processingTime', '2-8 週', 'steps', jsonb_build_array('確認資格', '備妥財力與保險', '安排落地住宿'), 'checklist', jsonb_build_array('護照', '財力證明', '保險', '履歷'))),
  ('usa', '美國', 'United States', '🇺🇸', jsonb_build_object('overview', '美國以 J1 學生暑期打工度假為主，限定學生身份。', 'ageRange', '在學學生', 'quota', '依代辦公告', 'stayDuration', '最長 4 個月 + 30 天旅遊', 'estimatedBudget', '15-25 萬台幣', 'processingTime', '3-6 個月', 'steps', jsonb_build_array('找代辦', '取得 DS-2019', '辦理 J1 簽證'), 'checklist', jsonb_build_array('護照', '在學證明', '財力證明', 'J1 簽證')))
on conflict (slug) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  flag_emoji = excluded.flag_emoji,
  visa_info = excluded.visa_info;
