USE travel_ai;

ALTER TABLE places
  ADD COLUMN vr_scene VARCHAR(100) NOT NULL DEFAULT 'scene_1' AFTER vr_url;

ALTER TABLE places
  MODIFY COLUMN vr_url VARCHAR(255) NOT NULL DEFAULT '';

UPDATE places
SET vr_scene = CASE slug
  WHEN 'ky-co' THEN 'scene_1'
  WHEN 'eo-gio' THEN 'scene_2'
  WHEN 'ghenh-rang' THEN 'scene_thanhpho360'
  WHEN 'chua-ong-nui' THEN 'scene_1'
  WHEN 'thap-doi' THEN 'scene_2'
  WHEN 'bai-bien-quy-nhon' THEN 'scene_thanhpho360'
  ELSE 'scene_1'
END;
