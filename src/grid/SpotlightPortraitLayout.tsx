/*
Copyright 2024 New Vector Ltd.

SPDX-License-Identifier: AGPL-3.0-only
Please see LICENSE in the repository root for full details.
*/

import { CSSProperties, forwardRef, useMemo } from "react";
import { useObservableEagerState } from "observable-hooks";
import classNames from "classnames";

import {
  CallLayout,
  GridTileModel,
  TileModel,
  arrangeTiles,
} from "./CallLayout";
import { SpotlightPortraitLayout as SpotlightPortraitLayoutModel } from "../state/CallViewModel";
import styles from "./SpotlightPortraitLayout.module.css";
import { useUpdateLayout } from "./Grid";

interface GridCSSProperties extends CSSProperties {
  "--grid-gap": string;
  "--grid-tile-width": string;
  "--grid-tile-height": string;
}

/**
 * An implementation of the "spotlight portrait" layout, in which the spotlight
 * tile is shown across the top of the screen, and the grid of participants
 * scrolls behind it.
 */
export const makeSpotlightPortraitLayout: CallLayout<
  SpotlightPortraitLayoutModel
> = ({ minBounds }) => ({
  scrollingOnTop: false,

  fixed: forwardRef(function SpotlightPortraitLayoutFixed(
    { model, Slot },
    ref,
  ) {
    useUpdateLayout();
    const tileModel: TileModel = useMemo(
      () => ({
        type: "spotlight",
        vms: model.spotlight,
        maximised: true,
      }),
      [model.spotlight],
    );

    return (
      <div ref={ref} className={styles.layer}>
        <div className={styles.spotlight}>
          <Slot className={styles.slot} id="spotlight" model={tileModel} />
        </div>
      </div>
    );
  }),

  scrolling: forwardRef(function SpotlightPortraitLayoutScrolling(
    { model, Slot },
    ref,
  ) {
    useUpdateLayout();
    const { width } = useObservableEagerState(minBounds);
    const { gap, tileWidth, tileHeight } = arrangeTiles(
      width,
      // TODO: We pretend that the minimum height is the width, because the
      // actual minimum height is difficult to calculate
      width,
      model.grid.length,
    );
    const tileModels: GridTileModel[] = useMemo(
      () => model.grid.map((vm) => ({ type: "grid", vm })),
      [model.grid],
    );

    return (
      <div
        ref={ref}
        className={styles.layer}
        style={
          {
            "--grid-gap": `${gap}px`,
            "--grid-tile-width": `${Math.floor(tileWidth)}px`,
            "--grid-tile-height": `${Math.floor(tileHeight)}px`,
          } as GridCSSProperties
        }
      >
        <div
          className={classNames(styles.spotlight, {
            [styles.withIndicators]: model.spotlight.length > 1,
          })}
        />
        <div className={styles.grid}>
          {tileModels.map((m) => (
            <Slot
              key={m.vm.id}
              className={styles.slot}
              id={m.vm.id}
              model={m}
            />
          ))}
        </div>
      </div>
    );
  }),
});
