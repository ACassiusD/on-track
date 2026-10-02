import { normalizeFraming, type PhotoFraming } from '../domain/photoFraming';
import { Directory, File, Paths } from 'expo-file-system';
import { makeId, type Photo, type State } from '../domain/model';
import { validDate } from '../domain/reminders';

// Copy into app-owned storage only after the user chooses to save. Never upload.
export async function saveLocalPhoto(uri: string, date: string, mode: State['mode'], today: string, commit: (change: (state: State) => State) => Promise<void>, framing?: PhotoFraming): Promise<Photo> {
  if (!validDate(date) || date > today) throw new Error('Choose a photo date today or earlier.');
  const id = makeId();
  const source = new File(uri);
  const directory = new Directory(Paths.document, 'progress-photos', mode);
  directory.create({ intermediates: true, idempotent: true });
  const copy = new File(directory, `${id}.${source.extension.replace('.', '') || 'jpg'}`);
  try {
    await source.copy(copy);
    const photo: Photo = { id, date, uri: copy.uri, scale: 1, x: 0, y: 0, ...(framing ? { framing: normalizeFraming(framing) } : {}) };
    await commit(s => ({ ...s, [mode]: { ...s[mode], photos: [...s[mode].photos, photo] } }));
    return photo;
  } catch (error) {
    if (copy.exists) try { copy.delete(); } catch {}
    throw error;
  }
}
