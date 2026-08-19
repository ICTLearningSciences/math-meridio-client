/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import GameScene, { gameObjects } from "../game-scene";
import {
  addBackground,
  addSprite,
  addText,
  addTween,
  playSound,
} from "../phaser-helpers";
import EventSystem from "../event-system";
import {
  SHORT_DANCE_CONVERSION_RATE,
  LONG_DANCE_CONVERSION_RATE,
  TOTAL_NUMBER_OF_VIDEOS,
  INSTRUCTIONAL_CONVERSION_RATE,
} from ".";
import { localStorageGet, SESSION_ID } from "../../store/local-storage";
import type { Player } from "../../store/slices/player/types";
import {
  arrayNRandom,
  delay,
  getRandomNumber,
  getRandomInt,
  getShuffledArray,
  getRandomArrayItem,
} from "../../helpers";

export interface SocialMediaSimulationData {
  player: string;
  playerAvatar?: Player;

  danceShorts: number;
  danceLongs: number;
  instructionals: number;

  danceShortsViewed: number;
  danceLongsViewed: number;
  instructionalsViewed: number;

  totalProfit: number;
}

export interface SocialMediaVideoAttempt {
  videoType: "dance_short" | "dance_long" | "instructional";
  success: boolean;
}

export class SimulationScene extends GameScene {
  simulation: SocialMediaSimulationData | undefined;
  videos: SocialMediaVideoAttempt[];
  curVideo: number;
  profit: number;

  numDanceShorts: number;
  numDanceLongs: number;
  numInstructional: number;

  videoBg?: Phaser.GameObjects.Image;
  videoText?: Phaser.GameObjects.Text;
  chatText: Phaser.GameObjects.Text[];

  like?: Phaser.GameObjects.Sprite;
  dislike?: Phaser.GameObjects.Sprite;
  likesText?: Phaser.GameObjects.Text;
  profitText?: Phaser.GameObjects.Text;
  avatars: Phaser.GameObjects.Sprite[];

  constructor() {
    super("Simulation");
    this.simulation = undefined;
    this.videos = [];
    this.curVideo = 0;
    this.profit = 0;
    this.numDanceShorts = 0;
    this.numDanceLongs = 0;
    this.numInstructional = 0;
    this.chatText = [];
    this.avatars = [];
  }

  preload() {
    super.preload();
    this.load.setPath("/assets/social");
    this.load.image("bg_short", "bg_short.png");
    this.load.image("bg_video", "bg_video.png");
    this.load.image("bg_spooky1", "bg_spooky1.png");
    this.load.image("bg_spooky2", "bg_spooky2.png");
    this.load.image("bg_spooky3", "bg_spooky4.png");
    this.load.image("bg_spooky4", "bg_spooky4.png");
    this.load.image("bg_western1", "bg_western1.png");
    this.load.image("bg_western2", "bg_western2.png");
    this.load.image("bg_western3", "bg_western3.png");
    this.load.image("bg_western4", "bg_western4.png");
    this.load.image("bg_computer1", "bg_computer1.png");
    this.load.image("bg_computer2", "bg_computer2.png");
    this.load.image("device1", "device1.png");
    this.load.image("device2", "device2.png");
    this.load.image("device3", "device3.png");
    this.load.image("device4", "device4.png");
    this.load.image("device5", "device5.png");
    this.load.image("device6", "device6.png");

    this.load.spritesheet("like", "like.png", {
      frameWidth: 360,
      frameHeight: 240,
    });
    this.load.spritesheet("dislike", "dislike.png", {
      frameWidth: 360,
      frameHeight: 240,
    });
    this.load.spritesheet("heart", "heart.png", {
      frameWidth: 55.17241379,
      frameHeight: 58,
    });
    this.load.audio("hammer", ["hammer.wav"]);
    this.load.audio("drill", ["drill.wav"]);
    this.load.audio("music5", ["music_country1.mp3"]);
    this.load.audio("music6", ["music_country2.mp3"]);
    this.load.audio("music7", ["music_spooky1.ogg"]);
    this.load.audio("music8", ["music_spooky2.mp3"]);

    this.load.setPath("/assets/concert");
    this.load.image("bg_concert", "map_concert_good.png");
    this.load.spritesheet("emotes", "emotes.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.audio("like", ["right.wav"]);
    this.load.audio("dislike", ["wrong.mp3"]);
    this.load.audio("music1", ["music_1.mp3"]);
    this.load.audio("music2", ["music_2.mp3"]);
    this.load.audio("music3", ["music_3.wav"]);
    this.load.audio("music4", ["music_4.wav"]);
  }

  create() {
    super.create();
    EventSystem.on("simulate", this.simulate, this);
    EventSystem.on(
      "setMuted",
      (isMuted: boolean) => {
        this.game.sound.mute = isMuted;
      },
      this,
    );
    this.anims.create({
      key: "like",
      frames: this.anims.generateFrameNumbers("like", {
        start: 0,
        end: 8 * 7,
      }),
      frameRate: 30,
    });
    this.anims.create({
      key: "dislike",
      frames: this.anims.generateFrameNumbers("dislike", {
        start: 0,
        end: 8 * 7,
      }),
      frameRate: 30,
    });
    this.anims.create({
      key: "heart",
      frames: this.anims.generateFrameNumbers("heart", {
        start: 29 * 3,
        end: 29 * 4,
      }),
      frameRate: 30,
    });

    this.anims.create({
      key: "emote_music",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 2,
        end: 8 * 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "emote_thinking",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 7,
        end: 8 * 8,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "emote_idea",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 8,
        end: 8 * 9,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "emote_working",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 6,
        end: 8 * 7,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "emote_?",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 1,
        end: 8 * 2,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "emote_!",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 0,
        end: 8 * 1,
      }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: "emote_angry",
      frames: this.anims.generateFrameNumbers("emotes", {
        start: 8 * 4,
        end: 8 * 5,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.createScene();
  }
  createScene() {
    this.destroySprite(this.mySprite);
    this.bg?.destroy();
    this.bg = addBackground(this, "bg_video");
    this.chatWindow?.setY(this.bg.displayHeight / 2);
    this.addChatMessage({
      messageId: "",
      sender: "SYSTEM",
      message: "Select a strategy first to see simulation",
      sessionId: localStorageGet(SESSION_ID) as string,
      phaseId: "",
    });
    super.createScene();
  }
  destroyScene() {
    this.destroySprite(this.mySprite);
    this.bg?.destroy();
    this.videoBg?.destroy();
    this.videoText?.destroy();
    this.like?.destroy();
    this.dislike?.destroy();
    this.likesText?.destroy();
    for (const c of this.chatText) c.destroy();
    this.chatText = [];
    for (const a of this.avatars) a.destroy();
    this.avatars = [];
  }

  update() {
    super.update();
  }

  simulate(simulation: SocialMediaSimulationData) {
    if (!this.bg) return;
    for (const obj of gameObjects) {
      obj.destroy();
    }
    this.sound.pauseAll();
    this.chatMsgText?.setAlpha(0);
    this.chatWindow?.setAlpha(0);
    this.simulation = simulation;
    this.destroySprite(this.mySprite);
    this.videos = [];
    this.curVideo = 0;
    for (
      let i = 0;
      i < Math.ceil(simulation.danceShorts / (TOTAL_NUMBER_OF_VIDEOS / 10));
      i++
    ) {
      this.videos.push({
        videoType: "dance_short",
        success: Math.random() <= INSTRUCTIONAL_CONVERSION_RATE,
      });
    }
    for (
      let i = 0;
      i < Math.ceil(simulation.danceLongs / (TOTAL_NUMBER_OF_VIDEOS / 10));
      i++
    ) {
      this.videos.push({
        videoType: "dance_long",
        success: Math.random() <= LONG_DANCE_CONVERSION_RATE,
      });
    }
    for (
      let i = 0;
      i < Math.ceil(simulation.instructionals / (TOTAL_NUMBER_OF_VIDEOS / 10));
      i++
    ) {
      this.videos.push({
        videoType: "instructional",
        success: Math.random() <= SHORT_DANCE_CONVERSION_RATE,
      });
    }
    this.videos = arrayNRandom(this.videos, this.videos.length);
    this.simulateVideos();
  }
  simulateVideos() {
    this.curVideo = 0;
    this.numDanceShorts = 0;
    this.numDanceLongs = 0;
    this.numInstructional = 0;
    this.profit = 0;
    this.playVideos();
  }

  playVideos() {
    if (this.curVideo >= this.videos.length) {
      return;
    }
    this.destroyScene();
    const video = this.videos[this.curVideo];
    if (video.videoType === "dance_short") {
      this.bg = addBackground(this, "bg_short");
      if (this.curVideo === 0) {
        this.playShortDance(video);
      } else {
        const y = this.bg.y;
        this.bg.y = this.bg.displayHeight * 2;
        addTween(this, {
          targets: this.bg,
          y: y,
          duration: 300,
          onComplete: () => {
            this.playShortDance(video);
          },
        });
      }
    }
    if (video.videoType === "dance_long") {
      this.bg = addBackground(this, "bg_video");
      if (this.curVideo === 0) {
        this.playLongDance(video);
      } else {
        const y = this.bg.y;
        this.bg.y = this.bg.displayHeight * 2;
        addTween(this, {
          targets: this.bg,
          y: y,
          duration: 300,
          onComplete: () => {
            this.playLongDance(video);
          },
        });
      }
    }
    if (video.videoType === "instructional") {
      this.bg = addBackground(this, "bg_video");
      if (this.curVideo === 0) {
        this.playInstructional(video);
      } else {
        const y = this.bg.y;
        this.bg.y = this.bg.displayHeight * 2;
        addTween(this, {
          targets: this.bg,
          y: y,
          duration: 300,
          onComplete: () => {
            this.playInstructional(video);
          },
        });
      }
    }
  }
  playShortDance(video: SocialMediaVideoAttempt) {
    if (!this.bg || !this.simulation) return;
    playSound(this, `music${getRandomInt(1, 4)}`, { loop: true });
    this.videoText = addText(this, "Dance Short", {
      bg: this.bg,
      heightRel: 0.1,
      x: this.bg.displayWidth * -0.225,
      y: this.bg.displayHeight * 0.44,
      maxFontSize: 60,
    });
    this.like = addSprite(this, "heart", 0, {
      x: this.bg.displayWidth * 0.95,
      y: this.bg.displayHeight * 0.7,
      heightRel: 0.08,
    })
      .play("heart")
      .stop()
      .setFrame(0);
    const avatar = this.simulation.playerAvatar?.avatar || [];
    this.mySprite = this.renderSpriteAvatar(avatar, {
      x: this.bg.displayWidth * 0.65,
      y: this.bg.displayHeight * 0.5,
      scale: 0.5,
    });
    const bubble = addSprite(this, "emotes", 0, {
      x: this.mySprite[0].x,
      y: this.mySprite[0].y - 100,
      heightRel: 0.3,
    })
      .setDepth(1000)
      .play("emote_music");
    const dance = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const anim = getRandomArrayItem(["walk", "walk_left", "walk_right"]);
        this.playSpriteAnim(this.mySprite, anim || "walk");
      },
      callbackScope: this,
    });
    if (video.success) {
      this.addShortMessages(
        video.success,
        [
          "Nice moves!",
          "Love this song",
          "🎵🎶",
          "💃🕺",
          "❤️❤️❤️",
          "👍",
          "Keep it up!",
          "Woooooo",
          "Yassss",
        ],
        getRandomInt(3, 7),
      );
    } else {
      this.addShortMessages(
        video.success,
        ["Meh", "Not my thing", "🥱💤", "👎"],
        getRandomInt(1, 3),
      );
    }
    if (this.curVideo === this.videos.length - 1) return;
    addTween(this, {
      targets: [this.bg, this.videoText, this.like],
      y:
        this.curVideo !== this.videos.length - 1
          ? -this.bg.displayHeight
          : undefined,
      delay: 4000,
      duration: 300,
      onStart: () => {
        this.sound.pauseAll();
        bubble.destroy();
        dance.destroy();
        for (const c of this.mySprite) c.destroy();
        this.mySprite = [];
        for (const c of this.chatText) c.destroy();
        this.chatText = [];
      },
      onComplete: () => {
        this.curVideo += 1;
        this.playVideos();
      },
    });
  }
  playLongDance(video: SocialMediaVideoAttempt) {
    if (!this.bg || !this.simulation) return;
    const song = getRandomInt(3, 8);
    playSound(this, `music${song}`, { loop: true });
    let bg = "bg_concert";
    if (song === 5 || song === 6) bg = `bg_western${getRandomInt(1, 4)}`;
    if (song === 7 || song === 8) bg = `bg_spooky${getRandomInt(1, 4)}`;
    this.videoBg = addSprite(this, bg, 0, {
      x: this.bg.displayWidth * 0.36,
      y: this.bg.displayHeight * 0.55,
      width: this.bg.displayWidth * 0.65,
      height: this.bg.displayHeight * 0.85,
    });
    this.videoText = addText(this, "Dance Video", {
      bg: this.bg,
      heightRel: 0.1,
      x: this.bg.displayWidth * -0.35,
      y: this.bg.displayHeight * 0.44,
      maxFontSize: 60,
    });
    this.like = addSprite(this, "like", 0, {
      x: this.bg.displayWidth * 0.55,
      y: this.bg.displayHeight + 30,
      heightRel: 0.1,
    })
      .play("like")
      .stop()
      .setFrame(0);
    this.dislike = addSprite(this, "dislike", 0, {
      x: this.bg.displayWidth * 0.65,
      y: this.bg.displayHeight + 30,
      heightRel: 0.1,
    })
      .play("dislike")
      .stop()
      .setFrame(0);
    const avatar = this.simulation.playerAvatar?.avatar || [];
    this.mySprite = this.renderSpriteAvatar(avatar, {
      x: this.videoBg.displayWidth * 0.51,
      y: this.videoBg.displayHeight * (song === 5 || song === 6 ? 0.9 : 0.7),
      scale: 0.2,
    });
    const bubble = addSprite(this, "emotes", 0, {
      x: this.mySprite[0].x,
      y: this.mySprite[0].y - 40,
      heightRel: 0.1,
    })
      .setDepth(1000)
      .play("emote_music");
    const dance = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const anim = getRandomArrayItem([
          "walk",
          "walk_left",
          "walk_right",
          "jump",
          "jump_left",
          "jump_right",
          "dance",
          "dance_back",
          "dance_left",
          "dance_right",
        ]);
        this.playSpriteAnim(this.mySprite, anim || "walk");
      },
      callbackScope: this,
    });

    if (video.success) {
      this.scrollMessages(
        video.success,
        [
          "Nice moves!",
          "Love this song :D",
          "Cool video",
          "🎵🎶 ",
          "💃🕺",
          "❤️❤️❤️❤️❤️",
          "👍👍👍",
          "Donated!",
          "Keep it up!",
          "Subbed for more",
          "Woooooo",
          "Yassssss",
          "You dropped this king 👑",
        ],
        getRandomInt(5, 7),
      );
    } else {
      this.scrollMessages(
        video.success,
        [
          "Laaaaame",
          "Too long lol",
          "Not my thing",
          "Kinda boring",
          "zzzzzz",
          "I sleep",
          "When does it get good",
          "What a tryhard",
          "🥱🥱🥱",
          "💤💤💤",
          "👎👎👎",
        ],
        getRandomInt(1, 3),
      );
    }

    if (this.curVideo === this.videos.length - 1) return;
    addTween(this, {
      targets: [this.bg, this.videoBg, this.videoText, this.like, this.dislike],
      y:
        this.curVideo !== this.videos.length - 1
          ? -this.bg.displayHeight
          : undefined,
      delay: 4000,
      duration: 300,
      onStart: () => {
        this.sound.pauseAll();
        bubble.destroy();
        dance.destroy();
        for (const c of this.mySprite) c.destroy();
        this.mySprite = [];
        for (const c of this.chatText) c.destroy();
        this.chatText = [];
        for (const a of this.avatars) a.destroy();
        this.avatars = [];
      },
      onComplete: () => {
        this.curVideo += 1;
        this.playVideos();
      },
    });
  }
  playInstructional(video: SocialMediaVideoAttempt) {
    if (!this.bg || !this.simulation) return;
    this.videoBg = addSprite(this, `bg_computer${getRandomInt(1, 2)}`, 0, {
      x: this.bg.displayWidth * 0.36,
      y: this.bg.displayHeight * 0.55,
      width: this.bg.displayWidth * 0.65,
      height: this.bg.displayHeight * 0.85,
    });
    this.videoText = addText(this, "How to fix it", {
      bg: this.bg,
      heightRel: 0.1,
      x: this.bg.displayWidth * -0.35,
      y: this.bg.displayHeight * 0.44,
      maxFontSize: 60,
    });
    this.like = addSprite(this, "like", 0, {
      x: this.bg.displayWidth * 0.55,
      y: this.bg.displayHeight + 30,
      heightRel: 0.1,
    })
      .play("like")
      .stop()
      .setFrame(0);
    this.dislike = addSprite(this, "dislike", 0, {
      x: this.bg.displayWidth * 0.65,
      y: this.bg.displayHeight + 30,
      heightRel: 0.1,
    })
      .play("dislike")
      .stop()
      .setFrame(0);
    const avatar = this.simulation.playerAvatar?.avatar || [];
    this.mySprite = this.renderSpriteAvatar(avatar, {
      x: this.videoBg.displayWidth * 0.4,
      y: this.videoBg.displayHeight * 0.8,
      scale: 0.5,
    });
    const device = addSprite(this, `device${getRandomInt(1, 6)}`, 0, {
      x: this.videoBg.displayWidth * 0.7,
      y: this.videoBg.displayHeight * 0.9,
      heightRel: 0.3,
    });

    const bubble = addSprite(this, "emotes", 0, {
      x: this.mySprite[0].x,
      y: this.mySprite[0].y - 60,
      heightRel: 0.2,
    })
      .setDepth(1000)
      .play(getRandomArrayItem(["emote_thinking", "emote_?"])!);
    this.playSpriteAnim(this.mySprite, "walk_right");
    const work = this.time.addEvent({
      delay: 500,
      callback: () => {
        bubble.play(getRandomArrayItem(["emote_idea", "emote_!"])!);
        this.playSpriteAnim(this.mySprite, "jump_right");
        delay(500).then(() => {
          bubble.play(getRandomArrayItem(["emote_working", "emote_angry"])!);
          this.playSpriteAnim(
            this.mySprite,
            getRandomArrayItem([
              "sword_right",
              "pickaxe_right",
              "axe_right",
              "plow_right",
              "fish_right",
            ])!,
          );
          playSound(this, getRandomArrayItem(["hammer", "drill"])!, {
            loop: true,
          });
        });
      },
      callbackScope: this,
    });

    if (video.success) {
      this.scrollMessages(
        video.success,
        [
          "Thank you!!",
          "Super helpful vid!",
          "Quick and easy to understand",
          "You made this look so easy!",
          "GG EZ",
          "This taught me how to love again",
          "Finally fixed it thanks to you!",
          "This changed my life",
          "Subbed for more",
          "You dropped this king 👑",
        ],
        getRandomInt(3, 5),
      );
    } else {
      this.scrollMessages(
        video.success,
        [
          "I still don't get it...",
          "help i set my house on fire",
          "Instructions unclear",
          "I hope you step on a lego",
          "am i dumb i dont get it",
          "Is it supposed to explode like that???",
        ],
        getRandomInt(1, 3),
      );
    }

    if (this.curVideo === this.videos.length - 1) return;
    addTween(this, {
      targets: [this.bg, this.videoBg, this.videoText, this.like, this.dislike],
      y:
        this.curVideo !== this.videos.length - 1
          ? -this.bg.displayHeight
          : undefined,
      delay: 4000,
      duration: 300,
      onStart: () => {
        this.sound.pauseAll();
        bubble.destroy();
        work.destroy();
        device.destroy();
        for (const c of this.mySprite) c.destroy();
        this.mySprite = [];
        for (const c of this.chatText) c.destroy();
        this.chatText = [];
        for (const a of this.avatars) a.destroy();
        this.avatars = [];
      },
      onComplete: () => {
        this.curVideo += 1;
        this.playVideos();
      },
    });
  }

  scrollMessages(success: boolean, msgs: string[], num?: number) {
    const messages = getShuffledArray(msgs);
    num = num || messages.length;
    for (let i = 0; i < num; i++) {
      delay(i * (3000 / num)).then(() =>
        this.scrollMessage(success, messages[i]),
      );
    }
  }
  scrollMessage(success: boolean, msg: string) {
    const text = addText(this, msg, {
      bg: this.videoBg,
      heightRel: 0.1,
      x: this.videoBg!.displayWidth * 0.5,
      y: this.videoBg!.displayHeight * getRandomNumber(-0.35, 0.35),
      maxFontSize: 78,
      textStyle: {
        align: "center",
      },
    });
    text.setDepth(1000);
    this.addMessage(success, msg);
    addTween(this, {
      targets: text,
      x: 0,
      duration: 2000,
      onComplete: () => {
        text.destroy();
      },
    });
  }
  addMessage(success: boolean, msg: string) {
    const text = addText(this, msg, {
      bg: this.bg,
      heightRel: 0.05,
      x: this.bg!.displayWidth * 0.35,
      y: this.bg!.displayHeight * (-0.3 + 0.1 * this.chatText.length),
      maxFontSize: 78,
      textStyle: {
        align: "flexstart",
      },
    });
    this.chatText.push(text);
    if (success) {
      this.like?.play("like");
      playSound(this, "like", { volume: 0.8 });
    } else {
      this.dislike?.play("dislike");
      playSound(this, "dislike");
    }
  }
  addShortMessages(success: boolean, msgs: string[], num?: number) {
    const messages = getShuffledArray(msgs);
    num = num || messages.length;
    for (let i = 0; i < num; i++) {
      delay(i * (3000 / num)).then(() =>
        this.addShortMessage(success, messages[i]),
      );
    }
  }
  addShortMessage(success: boolean, msg: string) {
    const text = addText(this, msg, {
      bg: this.bg,
      heightRel: 0.05,
      x: this.bg!.displayWidth * 0.3,
      y: this.bg!.displayHeight * (-0.3 + 0.1 * this.chatText.length),
      maxFontSize: 78,
      textStyle: {
        align: "flexstart",
      },
    });
    this.chatText.push(text);
    if (success) {
      this.like?.play("heart");
      playSound(this, "like", { volume: 0.8 });
    } else {
      playSound(this, "dislike");
    }
  }
}
