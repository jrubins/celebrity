import React from 'react'
import cn from 'classnames'

import {
  Round,
  TeamMember as TeamMemberType,
  TeamMemberConnection,
} from '../../../utils/types'

const Team = ({
  connections,
  members,
  name,
  points,
  round,
}: {
  connections: TeamMemberConnection[]
  members: TeamMemberType[]
  name: string
  points: number
  round: Round
}) => {
  const { leader, upNext, words = [] } = round

  const displayMembers = members
  if (displayMembers.length < 8) {
    const numMembersToAdd = 8 - displayMembers.length
    for (let i = 0; i < numMembersToAdd; i++) {
      displayMembers.push({ imgSrc: '', name: 'Empty' })
    }
  }

  return (
    <div className="team">
      <div className="team-header">
        <div className="team-name">{name}</div>
        <div className="team-points">
          Points: <span className="team-point-total">{points}</span>
        </div>
      </div>
      {members.map((teamMember, i) => {
        const isReady = !!words.find(({ createdBy }) => {
          return createdBy === teamMember.name
        })

        return (
          <TeamMember
            key={i}
            isConnected={
              !!connections.find(({ name }) => name === teamMember.name)
            }
            isReady={isReady}
            isUp={teamMember.name === leader}
            isUpNext={teamMember.name === upNext}
            round={round}
            teamMember={teamMember}
          />
        )
      })}
    </div>
  )
}

const TeamMember = ({
  isConnected,
  isReady,
  isUp,
  isUpNext,
  round,
  teamMember,
}: {
  isConnected: boolean
  isReady: boolean
  isUp: boolean
  isUpNext: boolean
  round: Round
  teamMember: TeamMemberType
}) => {
  const { imgSrc, name } = teamMember

  return (
    <div className="team-member">
      <div className="team-member-meta">
        <div
          className="team-member-img"
          style={{ backgroundImage: `url("${imgSrc}")` }}
        />
        <div className="team-member-name">{name}</div>
        <div
          className={cn('team-member-connection', {
            'team-member-connection-active': isConnected,
          })}
          title={isConnected ? 'Active' : 'Offline'}
        />
        {isUp && <div className="team-member-leader">Up Now!</div>}
        {isUpNext && <div className="team-member-next">Up Next</div>}
      </div>
      {round.state === 'new' && (
        <div
          className={cn('team-member-status', {
            'team-member-status-ready': isReady,
          })}
        >
          {isReady ? 'Ready' : '---'}
        </div>
      )}
    </div>
  )
}

export default Team
