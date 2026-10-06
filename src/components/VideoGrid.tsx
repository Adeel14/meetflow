import React from 'react';
import { Participant, MeetingViewMode } from '../types/meeting';
import { ParticipantTile } from './ParticipantTile';
import { ScreenShareStage } from './ScreenShareStage';

interface VideoGridProps {
  participants: Participant[];
  viewMode: MeetingViewMode;
  pinnedPeerId: string | null;
  onTogglePin: (peerId: string) => void;
  mirrorLocalVideo: boolean;
  canModerate: boolean;
  onMuteParticipant: (peerId: string) => void;
  onKickParticipant: (peerId: string) => void;
  activeScreenPresenter: Participant | null;
  activeScreenStream: MediaStream | null;
  isLocalPresenting: boolean;
  onStopScreenShare: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  viewMode,
  pinnedPeerId,
  onTogglePin,
  mirrorLocalVideo,
  canModerate,
  onMuteParticipant,
  onKickParticipant,
  activeScreenPresenter,
  activeScreenStream,
  isLocalPresenting,
  onStopScreenShare,
}) => {
  // If someone is sharing screen
  if (activeScreenPresenter && activeScreenStream) {
    return (
      <div className="flex flex-col lg:flex-row h-full w-full gap-3 p-3 overflow-hidden">
        {/* Main Stage Screen Share */}
        <div className="flex-1 h-full min-h-[340px] flex">
          <ScreenShareStage
            screenStream={activeScreenStream}
            presenter={activeScreenPresenter}
            isLocalPresenting={isLocalPresenting}
            onStopScreenShare={onStopScreenShare}
          />
        </div>

        {/* Participant Filmstrip */}
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:w-64 shrink-0 pb-1 lg:pb-0">
          {participants.map((participant) => (
            <div key={participant.id} className="w-44 lg:w-full h-32 lg:h-36 shrink-0">
              <ParticipantTile
                participant={participant}
                isPinned={pinnedPeerId === participant.id}
                onTogglePin={() => onTogglePin(participant.id)}
                mirror={mirrorLocalVideo}
                canModerate={canModerate}
                onMuteParticipant={onMuteParticipant}
                onKickParticipant={onKickParticipant}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Determine spotlight participant for Speaker View or Pinned participant
  const pinnedParticipant = pinnedPeerId
    ? participants.find((p) => p.id === pinnedPeerId)
    : null;

  const activeSpeaker = participants.find((p) => p.isSpeaking && !p.isMuted);
  const spotlightParticipant = pinnedParticipant || activeSpeaker || participants[0];

  // Speaker View Mode
  if (viewMode === 'speaker' && spotlightParticipant) {
    const thumbnails = participants.filter((p) => p.id !== spotlightParticipant.id);

    return (
      <div className="flex flex-col lg:flex-row h-full w-full gap-3 p-3 overflow-hidden">
        {/* Dominant Spotlight Stage */}
        <div className="flex-1 h-full min-h-[300px] flex">
          <ParticipantTile
            participant={spotlightParticipant}
            isDominant={true}
            isPinned={pinnedPeerId === spotlightParticipant.id}
            onTogglePin={() => onTogglePin(spotlightParticipant.id)}
            mirror={mirrorLocalVideo}
            canModerate={canModerate}
            onMuteParticipant={onMuteParticipant}
            onKickParticipant={onKickParticipant}
          />
        </div>

        {/* Thumbnail Strip */}
        {thumbnails.length > 0 && (
          <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:w-64 shrink-0 pb-1 lg:pb-0">
            {thumbnails.map((p) => (
              <div key={p.id} className="w-44 lg:w-full h-32 lg:h-36 shrink-0">
                <ParticipantTile
                  participant={p}
                  isPinned={pinnedPeerId === p.id}
                  onTogglePin={() => onTogglePin(p.id)}
                  mirror={mirrorLocalVideo}
                  canModerate={canModerate}
                  onMuteParticipant={onMuteParticipant}
                  onKickParticipant={onKickParticipant}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard Grid View Mode
  const count = participants.length;

  let gridColsClass = 'grid-cols-1';
  if (count === 2) {
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (count >= 3 && count <= 4) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2';
  } else if (count >= 5 && count <= 6) {
    gridColsClass = 'grid-cols-2 md:grid-cols-3';
  } else if (count >= 7 && count <= 9) {
    gridColsClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  } else if (count > 9) {
    gridColsClass = 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  }

  return (
    <div className="h-full w-full p-3 overflow-y-auto flex items-center justify-center">
      <div
        className={`grid gap-3 w-full h-full max-h-full ${gridColsClass} auto-rows-fr`}
        style={{ minHeight: count > 2 ? '420px' : '260px' }}
      >
        {participants.map((participant) => (
          <div key={participant.id} className="w-full h-full min-h-[180px]">
            <ParticipantTile
              participant={participant}
              isPinned={pinnedPeerId === participant.id}
              onTogglePin={() => onTogglePin(participant.id)}
              mirror={mirrorLocalVideo}
              canModerate={canModerate}
              onMuteParticipant={onMuteParticipant}
              onKickParticipant={onKickParticipant}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
