const sounds = {
  bid: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Tick
  rankChange: new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'), // Whoosh
  win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'), // Celebration
  alert: new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'), // Beep
};

export const playSound = (type) => {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(e => console.log("Sound play prevented", e));
  }
};
