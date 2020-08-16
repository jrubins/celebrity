import faunadb from 'faunadb'
import randomWords from 'random-words'

import { GenericObject, Room, Round, TeamMember } from '../../../shared/types'
import { info } from '../../../shared/logs'
import * as DB from '../types'

/**
 * URLs of images to use for people in the game.
 */
const IMAGE_URLS = [
  'https://assets.petco.com/petco/image/upload/f_auto,q_auto/doghp-092319-img-new-pet-puppy-256w-256h-d',
  'https://assets.petco.com/petco/image/upload/f_auto,q_auto/cathp-092619-img-new-pet-adult-256w-256h-d',
  'https://ichef.bbci.co.uk/images/ic/256xn/p024lg9b.jpg',
  'https://i.pinimg.com/originals/a0/6b/64/a06b643c50925e4ed1a36882ce1ecb13.jpg',
]

const q = faunadb.query
const dbSecret = process.env.DB_SECRET
if (!dbSecret) {
  throw new Error(
    'Could not connect to DB. Please add a value for the DB_SECRET environment variable.'
  )
}
const client = new faunadb.Client({
  secret: dbSecret,
})

/**
 * Adds the provided user to the room.
 */
export async function addUserToRoom({
  room,
  user,
}: {
  room: DB.Room
  user: string
}): Promise<DB.Room> {
  let roomResponse = room
  const { rounds, teamA = [], teamB = [] } = room.data
  const allPeople = [...teamA, ...teamB]
  const alreadyOnTeam = allPeople.find(({ name }) => name === user)

  if (!alreadyOnTeam) {
    info('Adding user to team.', { user })

    const takenImages = allPeople.map(({ imgSrc }) => imgSrc)
    const imgSrc = IMAGE_URLS.find((src) => {
      return !takenImages.includes(src)
    })
    const newMember: TeamMember = { imgSrc: imgSrc || '', name: user }
    if (teamA.length <= teamB.length) {
      teamA.push(newMember)
    } else {
      teamB.push(newMember)
    }

    const newRound = rounds.find(({ state }) => state === 'new')
    if (newRound) {
      if (!newRound.leader) {
        newRound.leader = user
      } else if (!newRound.upNext) {
        newRound.upNext = user
      }
    }

    roomResponse = await updateRoom(room.ref, { rounds, teamA, teamB })
  }

  return roomResponse
}

/**
 * Creates a new room.
 */
export async function createRoom({
  data,
}: {
  data: {
    name: string
    password: string
  }
}): Promise<DB.Room> {
  const newRound: Round = {
    leader: null,
    state: 'new',
    turns: 0,
    upNext: null,
    words: [],
  }
  const newRoom: Room = {
    ...data,
    id: randomWords({ exactly: 3, join: '-' }),
    rounds: [newRound],
    teamA: [],
    teamB: [],
  }
  const response: DB.Room = await client.query(
    q.Create(q.Ref('classes/rooms'), {
      data: newRoom,
    })
  )

  return response
}

/**
 * Searches for a room in the provided index with the provided terms.
 */
export async function findRoom({
  index,
  terms,
}: {
  index: string
  terms: string[]
}): Promise<DB.Room> {
  const response: DB.QueryResult<DB.Room> = await client.query(
    q.Map(
      q.Paginate(q.Match(q.Index(index), terms)),
      q.Lambda('X', q.Get(q.Var('X')))
    )
  )

  return response.data[0]
}

/**
 * Returns a single room by the provided ID.
 */
export async function getRoomById(roomId: string): Promise<DB.Room> {
  const response: DB.Room = await client.query(
    q.Get(q.Match(q.Index('rooms_ids'), roomId))
  )

  return response
}

/**
 * Updates the specified room with new data.
 */
export async function updateRoom(
  roomRef: string,
  data: GenericObject
): Promise<DB.Room> {
  const response: DB.Room = await client.query(q.Update(roomRef, { data }))

  return response
}
