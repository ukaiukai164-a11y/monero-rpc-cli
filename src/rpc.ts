import moneroTs from "monero-ts";

type GetOut = {
  height: number;
  key: string;
  mask: string;
  txid: string;
  unlocked: boolean;
};

type GetOutsResponse = {
  outs: GetOut[];
};


const daemonUri = process.env.MONERO_DAEMON_URI ?? "http://127.0.0.1:18081";

export async function connectDaemon() {
  const daemon = await moneroTs.connectToDaemonRpc(daemonUri);
  return daemon;
}


export async function getOuts(globalIndices: number[]) {
  const response = await fetch(
    `${daemonUri}/get_outs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        outputs: globalIndices.map((globalIndex) => ({
          amount: 0,
          index: globalIndex
        })),
        get_txid: true
      })
    }
  );
  if (!response.ok) {
    throw new Error(`get_outs failed: ${response.status}`);
  }
  const data = await response.json() as GetOutsResponse;
  return data;
}
