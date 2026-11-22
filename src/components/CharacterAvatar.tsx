import { useState } from 'react';
import characterImages from '../data/characterImages.json';
import type { Character } from '../types';

const IMAGE_MAP: Record<string, string> = characterImages;

function getInitials(name: string): string {
  const base = name.split(' (')[0].split(':')[0].trim();
  const parts = base.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return base.slice(0, 2).toUpperCase();
}

export function CharacterAvatar({
  character,
  size = 44,
}: {
  character: Character;
  size?: number;
}) {
  const imgUrl = IMAGE_MAP[character.id];
  const [failed, setFailed] = useState(false);

  const borderClass = character.rarity === 5 ? 'avatar-rarity-5' : 'avatar-rarity-4';

  return (
    <div
      className={`char-avatar el-bg-${character.element} ${borderClass}`}
      style={{ width: size, height: size }}
    >
      {imgUrl && !failed ? (
        <img
          src={imgUrl}
          alt={character.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="avatar-initials">{getInitials(character.name)}</span>
      )}
    </div>
  );
}
