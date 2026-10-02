import axios from "axios";
import type { SongMatchInfo, SongUrlResult } from "./unblock";
import getKuwoSongUrl from "./kuwo";
import getBodianSongUrl from "./bodian";

/** 支持的解锁源，与上游保持一致（gequbao 已废弃） */
export const UNBLOCK_SERVERS = ["netease", "kuwo", "bodian"] as const;

export type UnblockServer = (typeof UNBLOCK_SERVERS)[number];

export type UnblockQuery = Record<string, string | undefined>;

/**
 * 直接获取网易云云盘链接
 * 来源 GD音乐台(music.gdstudio.xyz)
 */
const getNeteaseSongUrl = async (id?: string): Promise<SongUrlResult> => {
  try {
    if (!id) return { code: 404, url: null };
    const result = await axios.get("https://music-api.gdstudio.xyz/api.php", {
      params: { types: "url", id },
    });
    console.log("🔗 NeteaseSongUrl URL:", result.data.url);
    return { code: 200, url: result.data.url };
  } catch (error) {
    console.error("❌ Get NeteaseSongUrl Error:", error);
    return { code: 404, url: null };
  }
};

/** 构造匹配信息（fallback 用 lastIndexOf 兼容歌名含连字符的情况） */
const buildMatchInfo = (query: UnblockQuery): SongMatchInfo => {
  let songName = query.songName || "";
  let artist = query.artist || "";
  const keyword = query.keyword || "";
  if (!songName && keyword) {
    const lastIdx = keyword.lastIndexOf("-");
    if (lastIdx > 0) {
      songName = keyword.slice(0, lastIdx).trim();
      artist = artist || keyword.slice(lastIdx + 1).trim();
    } else {
      songName = keyword.trim();
    }
  }
  return { keyword, songName, artist };
};

/** 是否为受支持的解锁路径 */
export const isUnblockPath = (path: string): boolean =>
  path === "" || (UNBLOCK_SERVERS as readonly string[]).includes(path);

/**
 * 处理解锁请求
 * @param path 去掉 /api/unblock 前缀后的子路径
 * @param query 查询参数
 */
export const handleUnblockRoute = async (path: string, query: UnblockQuery): Promise<unknown> => {
  if (path === "") {
    return {
      name: "UnblockAPI",
      description: "SPlayer UnblockAPI service",
      author: "@imsyy",
      content:
        "部分接口采用 @939163156 by GD音乐台(music.gdstudio.xyz)，仅供本人学习使用，不可传播下载内容，不可用于商业用途。",
    };
  }
  if (path === "netease") return getNeteaseSongUrl(query.id);
  if (path === "kuwo") return getKuwoSongUrl(buildMatchInfo(query));
  if (path === "bodian") return getBodianSongUrl(buildMatchInfo(query));
  return null;
};
