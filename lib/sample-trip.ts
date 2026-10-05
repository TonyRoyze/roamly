import { portraits } from './map-data'
import { readDemoData, updateDemoData, type DemoUser } from './poc-store'

export function openSampleTrip(): DemoUser {
  const users: DemoUser[] = [
    {
      id: 'sample-maya',
      name: 'Maya Chen',
      role: 'traveler',
      area: 'Colombo',
      avatar: portraits[0],
      bio: 'Collecting little moments, good coffee, and stories from everywhere.',
      interests: 'Photography, Food, Slow travel',
      languages: 'English, Mandarin',
    },
    {
      id: 'sample-nimal',
      name: 'Nimal Perera',
      role: 'local_guide',
      area: 'Colombo',
      avatar: portraits[1],
      bio: 'Born here, still discovering. Come for the street food, stay for the stories.',
      interests: 'Street food, History, City walks',
      languages: 'English, Sinhala',
    },
    {
      id: 'sample-alex',
      name: 'Alex Morgan',
      role: 'traveler',
      area: 'Colombo',
      avatar: portraits[2],
      bio: 'One backpack, no fixed plans. Always up for a walk.',
      interests: 'Hiking, Architecture',
      languages: 'English',
    },
    {
      id: 'sample-amaya',
      name: 'Amaya Silva',
      role: 'local_guide',
      area: 'Colombo',
      avatar: portraits[3],
      bio: 'Let’s find the quiet corners and the best sunset in the city.',
      interests: 'Art, Nature, Coffee',
      languages: 'English, Sinhala, Tamil',
    },
    {
      id: 'sample-sam',
      name: 'Sam Wilson',
      role: 'traveler',
      area: 'Colombo',
      bio: 'Here for the food and the ocean.',
      interests: 'Surfing, Food',
      languages: 'English',
    },
  ]
  updateDemoData((current) => ({
    ...current,
    users: [
      ...current.users,
      ...users.filter(
        (user) => !current.users.some((item) => item.id === user.id),
      ),
    ],
    intents: [
      ...current.intents,
      ...[
        {
          id: 'sample-plan-maya',
          travelerId: 'sample-maya',
          travelerName: 'Maya Chen',
          message: 'Sunset at Galle Face, and something delicious after?',
          area: 'Colombo',
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-plan-alex',
          travelerId: 'sample-alex',
          travelerName: 'Alex Morgan',
          message: 'Anyone know the hidden corners of Pettah?',
          area: 'Colombo',
          active: true,
          createdAt: new Date().toISOString(),
        },
      ].filter(
        (intent) => !current.intents.some((item) => item.id === intent.id),
      ),
    ],
    packages: [
      ...current.packages,
      ...[
        {
          id: 'sample-food',
          guideId: 'sample-nimal',
          title: 'Colombo, one bite at a time',
          summary:
            'A walk through Pettah, family-run food spots, and fresh kottu. Tastings and a local’s stories included.',
          price: 35,
          duration: '3 hours',
          category: 'Food',
        },
        {
          id: 'sample-coast',
          guideId: 'sample-amaya',
          title: 'The slow side of Colombo',
          summary:
            'Tree-lined lanes, an independent gallery, and a seaside sunset. A private walk at your pace.',
          price: 25,
          duration: '2 hours',
          category: 'Explore',
        },
      ].filter((pack) => !current.packages.some((item) => item.id === pack.id)),
    ],
  }))
  return (
    readDemoData().users.find((user) => user.id === 'sample-maya') ?? users[0]
  )
}
