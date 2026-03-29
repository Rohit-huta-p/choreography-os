export const templates = {
  standard_wedding: {
    name: 'Standard Wedding',
    performances: [
      { title: 'Bride Solo', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
      { title: 'Groom Solo', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
      { title: 'Couple Dance', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: "Bride's Friends", songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: "Groom's Friends", songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: "Bride's Family", songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: "Groom's Family", songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: 'Kids Performance', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
      { title: 'Bridesmaids', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: 'Groomsmen', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: 'Parents Dance', songs: [{ name: 'TBD', artist: '', duration_seconds: 210 }] },
      { title: 'Group Finale', songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: "Bride's Siblings", songs: [{ name: 'TBD', artist: '', duration_seconds: 210 }] },
      { title: "Groom's Siblings", songs: [{ name: 'TBD', artist: '', duration_seconds: 210 }] },
      { title: 'Surprise Act', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
    ],
    tasks: [
      { title: 'Day-of Checklist', tasks: [
        { text: 'Confirm DJ playlist order', completed: false, order: 0 },
        { text: 'Test sound system at venue', completed: false, order: 1 },
        { text: 'Collect all props from storage', completed: false, order: 2 },
        { text: 'Brief background dancers', completed: false, order: 3 },
        { text: 'Final rehearsal run-through', completed: false, order: 4 },
      ]},
    ],
  },

  small_sangeet: {
    name: 'Small Sangeet',
    performances: [
      { title: 'Bride Solo', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
      { title: 'Groom Solo', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
      { title: 'Couple Dance', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: "Bride's Side Group", songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: "Groom's Side Group", songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: 'Friends Mashup', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: 'Parents Performance', songs: [{ name: 'TBD', artist: '', duration_seconds: 210 }] },
      { title: 'Grand Finale', songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
    ],
    tasks: [
      { title: 'Prep Checklist', tasks: [
        { text: 'Finalize song selections', completed: false, order: 0 },
        { text: 'Arrange props', completed: false, order: 1 },
        { text: 'Sound check', completed: false, order: 2 },
      ]},
    ],
  },

  engagement: {
    name: 'Engagement',
    performances: [
      { title: 'Couple Entry', songs: [{ name: 'TBD', artist: '', duration_seconds: 150 }] },
      { title: 'Couple Dance', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: 'Friends Performance', songs: [{ name: 'TBD', artist: '', duration_seconds: 240 }] },
      { title: 'Family Group', songs: [{ name: 'TBD', artist: '', duration_seconds: 300 }] },
      { title: 'Surprise Act', songs: [{ name: 'TBD', artist: '', duration_seconds: 180 }] },
    ],
    tasks: [
      { title: 'Checklist', tasks: [
        { text: 'Coordinate with DJ', completed: false, order: 0 },
        { text: 'Arrange ring ceremony music', completed: false, order: 1 },
      ]},
    ],
  },

  blank: {
    name: 'Blank Canvas',
    performances: [],
    tasks: [],
  },
};

export const getTemplatePositions = (count) => {
  const positions = [];
  const cols = 3;
  const gapX = 360;
  const gapY = 280;
  const startX = 50;
  const startY = 50;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({ x: startX + col * gapX, y: startY + row * gapY });
  }
  return positions;
};
