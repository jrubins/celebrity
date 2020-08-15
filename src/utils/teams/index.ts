import { Round, TeamMember } from '../types'

/**
 * Given a current round, returns the person that should be the next leader and the
 * person that will be on-deck next.
 */
export function getNextLeaders({
  round,
  teamA,
  teamB,
}: {
  round: Round
  teamA: TeamMember[]
  teamB: TeamMember[]
}) {
  let upNext = ''
  if (round.leader) {
    upNext = getUpNextInTeam({ leader: round.leader, team: teamA })

    if (!upNext) {
      upNext = getUpNextInTeam({ leader: round.leader, team: teamB })
    }
  }

  return { leader: round.upNext, upNext }
}

/**
 * Returns the team member that should be up next given the current leader.
 */
function getUpNextInTeam({
  leader,
  team,
}: {
  leader: string
  team: TeamMember[]
}): string {
  const leaderInTeamIndex = team.findIndex(({ name }) => leader === name)
  if (leaderInTeamIndex === -1) {
    return ''
  }

  const upNextIndex =
    leaderInTeamIndex + 1 >= team.length ? 0 : leaderInTeamIndex + 1

  return team[upNextIndex].name
}
