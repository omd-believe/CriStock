const PLAYER_IMAGES = {
  'virat kohli': '/players/virat-kohli.webp',
  'jasprit bumrah': '/players/jasprit-bumrah.webp',
  'rohit sharma': '/players/rohit-sharma.webp',
  'hardik pandya': '/players/hardik-pandya.webp',
  'rishabh pant': '/players/rishabh-pant.webp',
  'ravindra jadeja': '/players/ravindra-jadeja.webp',
  'mohammed siraj': '/players/mohammed-siraj.webp',
  'yashasvi jaiswal': '/players/yashasvi-jaiswal.webp',
  'shubman gill': '/players/shubman-gill.webp',
  'kl rahul': '/players/kl-rahul.webp',
};

export const getPlayerImage = (playerName) => {
  if (!playerName) {
    return '/players/default-player.webp';
  }

  const normalizedName = String(playerName)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

  return (
    PLAYER_IMAGES[normalizedName] ||
    '/players/default-player.webp'
  );
};

export default PLAYER_IMAGES;