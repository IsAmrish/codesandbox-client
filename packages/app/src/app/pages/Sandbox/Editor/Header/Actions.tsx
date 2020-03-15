import Tooltip from '@codesandbox/common/lib/components/Tooltip';
import { Avatar, Button, Stack } from '@codesandbox/components';
import css from '@styled-system/css';
import { useOvermind } from 'app/overmind';
import { UserMenu } from 'app/pages/common/UserMenu';
import React, { useEffect, useState } from 'react';
import * as featureFlags from '@codesandbox/common/lib/utils/feature-flags';

import {
  EmbedIcon,
  ForkIcon,
  LikeIcon,
  PreferenceIcon,
  ReloadIcon,
} from './icons';
import { Collaborators } from './Collaborators';
import { CollaboratorHeads } from './CollaboratorHeads';

const TooltipButton = ({ tooltip, ...props }) => (
  <Tooltip content={tooltip}>
    <Button {...props} />
  </Tooltip>
);

export const Actions = () => {
  const {
    actions: {
      modalOpened,
      editor: { likeSandboxToggled, forkSandboxClicked },
      explore: { pickSandboxModal },
    },
    state: {
      hasLogIn,
      updateStatus,
      user,
      editor: {
        currentSandbox: {
          id,
          author,
          owned,
          title,
          description,
          likeCount,
          userLiked,
        },
      },
    },

    actions: { signInClicked },
  } = useOvermind();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!fadeIn) {
      const timeoutId = setTimeout(() => {
        setFadeIn(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }

    return () => {};
  }, [fadeIn]);

  const handleSignIn = async () => {
    await signInClicked({ useExtraScopes: false });
  };

  let primaryAction;
  if (!hasLogIn) primaryAction = 'Sign in';
  else primaryAction = owned ? 'Share' : 'Fork';

  return (
    <Stack
      align="center"
      gap={2}
      css={{ '> button': { width: 'auto' } }}
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.25s ease-in-out',
      }}
    >
      {updateStatus === 'available' && (
        <TooltipButton
          tooltip="Update Available! Click to Refresh."
          variant="link"
          onClick={() => document.location.reload()}
        >
          <ReloadIcon css={css({ height: 3 })} />
        </TooltipButton>
      )}

      {!hasLogIn && (
        <TooltipButton
          tooltip="Open preferences"
          variant="link"
          onClick={() => modalOpened({ modal: 'preferences' })}
        >
          <PreferenceIcon css={css({ height: 3 })} />
        </TooltipButton>
      )}

      {featureFlags.ACCESS_SHEET ? (
        <>
          <CollaboratorHeads />
        </>
      ) : (
        <>
          {hasLogIn ? (
            <TooltipButton
              tooltip={userLiked ? 'Undo like sandbox' : 'Like sandbox'}
              variant="link"
              onClick={() => likeSandboxToggled(id)}
            >
              <LikeIcon
                css={css({
                  height: 3,
                  marginRight: 1,
                  color: userLiked ? 'reds.500' : 'inherit',
                })}
              />{' '}
              <span>{likeCount}</span>
            </TooltipButton>
          ) : (
            <Stack gap={1} paddingX={2} align="center">
              <LikeIcon css={css({ height: 3 })} />
              <span>{likeCount}</span>
            </Stack>
          )}
        </>
      )}

      {false && user?.curatorAt && (
        <Button
          variant="secondary"
          css={css({ paddingX: 3 })}
          onClick={() => pickSandboxModal({ description, id, title })}
        >
          Pick
        </Button>
      )}

      {featureFlags.ACCESS_SHEET && (
        <>
          {author ? (
            <Collaborators
              renderButton={props => (
                <Button variant="primary" {...props}>
                  <EmbedIcon css={css({ height: 3, marginRight: 1 })} /> Share
                </Button>
              )}
            />
          ) : (
            <Button
              variant={primaryAction === 'Share' ? 'primary' : 'secondary'}
              onClick={() => modalOpened({ modal: 'share' })}
            >
              <EmbedIcon css={css({ height: 3, marginRight: 1 })} /> Embed
            </Button>
          )}
        </>
      )}

      {!featureFlags.ACCESS_SHEET && (
        <Button
          variant={primaryAction === 'Share' ? 'primary' : 'secondary'}
          onClick={() => modalOpened({ modal: 'share' })}
        >
          <EmbedIcon css={css({ height: 3, marginRight: 1 })} /> Embed
        </Button>
      )}

      <Button
        variant={primaryAction === 'Fork' ? 'primary' : 'secondary'}
        onClick={forkSandboxClicked}
      >
        <ForkIcon css={css({ height: 3, marginRight: 1 })} /> Fork
      </Button>
      <Button
        variant="secondary"
        css={css({ paddingX: 3 })}
        onClick={() => modalOpened({ modal: 'newSandbox' })}
      >
        Create Sandbox
      </Button>
      {hasLogIn ? (
        <UserMenu>
          <Avatar
            user={{ ...user, subscriptionSince: null }}
            css={css({
              size: '26px', // match button size next to it
            })}
          />
        </UserMenu>
      ) : (
        <Button variant="primary" onClick={handleSignIn}>
          Sign in
        </Button>
      )}
    </Stack>
  );
};
