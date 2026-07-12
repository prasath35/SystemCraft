import { PracticeScenario } from "../types";

export const practiceScenarios: PracticeScenario[] = [
  {
    id: "07204f08-e70d-4e54-b221-bb03938aab01",
    title: "Design YouTube",
    tagline: "Distributed video sharing platform handling massive transcoding and delivery pipelines.",
    difficulty: "Hard",
    estimatedTime: "45 Mins",
    qps: "10K Upload QPS, 50M Playback QPS",
    storage: "500 TB / day video files, 1 PB metadata",
    prompt: "Design a video sharing service like YouTube. The platform must handle seamless upload of video files, transcode them into multiple resolutions (1080p, 720p, 360p) and formats (H.264, VP9) for adaptive bitrate streaming, store petabytes of assets globally, and serve streaming traffic under 150ms latency using Edge CDNs.",
    starterTips: [
      "Explain the trade-offs of using Chunked Upload protocols (like Tus) for stability over slow networks.",
      "Detail your transcoding pipeline (using Message Queues and transient GKE workers to prevent bottlenecks).",
      "Explain how you would partition the Metadata Database (e.g., sharding PostgreSQL based on video_id or channel_id).",
      "Mention your Geo-Distributed CDN caching policies for viral videos vs. tail-end videos."
    ]
  },
  {
    id: "07204f08-e70d-4e54-b221-bb03938aab02",
    title: "Design Twitter / X",
    tagline: "High-throughput social media platform scaling massive feed generation and write-spikes.",
    difficulty: "Medium",
    estimatedTime: "45 Mins",
    qps: "100K Write QPS, 10M Read QPS",
    storage: "12 TB / day text postings, 500 TB multimedia",
    prompt: "Design a microblogging service like Twitter/X. Focus on real-time newsfeed generation (calculating timelines for users), handling posting tweets, search indexing, media storage scaling, and optimizing for celebrity write spikes (users with 50M+ followers).",
    starterTips: [
      "Contrast Push (Fan-out on write) vs Pull (Fan-out on read) models for newsfeed generation.",
      "Use Redis Sorted Sets to cache pre-computed user feeds for sub-50ms reads.",
      "Detail how you mitigate celeb spikes (hybrid approach: push for normal users, pull for celebs).",
      "Describe the write pipeline with Message Queues (Kafka) to decouple ingestion from DB persistence."
    ]
  },
  {
    id: "07204f08-e70d-4e54-b221-bb03938aab03",
    title: "Design a Distributed Rate Limiter",
    tagline: "Ultra-low latency security gateway protecting downstream APIs from heavy abuse.",
    difficulty: "Easy",
    estimatedTime: "30 Mins",
    qps: "500K Input QPS, <2ms response budget",
    storage: "Minimal memory footprint (Redis cluster)",
    prompt: "Design a high-performance, distributed, and highly available rate limiter that can be deployed at the API Gateway layer. The rate limiter must evaluate API requests globally and accept or reject them under a 2ms latency penalty.",
    starterTips: [
      "Compare rate-limiting algorithms: Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter.",
      "Discuss data structures in Redis (using Sorted Sets for Sliding Windows vs Hashes for Token Buckets).",
      "Explain how you solve Redis write latency via Local Caching with TTL combined with asynchronous syncs.",
      "Discuss multi-region synchronization: Consistent Hashing and master-replica architectures."
    ]
  },
  {
    id: "07204f08-e70d-4e54-b221-bb03938aab04",
    title: "Design a Distributed Message Queue",
    tagline: "Highly durable, low-latency, horizontally scalable publish-subscribe messaging backbone.",
    difficulty: "Hard",
    estimatedTime: "45 Mins",
    qps: "2M Ingestion QPS, 5GB/s throughput",
    storage: "100 TB / day sequential append log segments",
    prompt: "Design a distributed messaging queue similar to Apache Kafka or RabbitMQ. The queue must support high-throughput message publishing, structured consumer groupings, sequential partition delivery, and offset retention while ensuring zero data loss (durability).",
    starterTips: [
      "Explain the performance advantages of using Append-Only commit logs for sequential disk I/O.",
      "Detail your replication and consensus algorithm (using ZooKeeper/KRaft or Paxos to select Partition Leaders).",
      "Explain 'Zero-Copy' network transfers (using Linux sendfile) to pipe data directly from kernel cache to network socket.",
      "Discuss consumer offset tracking: storage choices (e.g. special internal log topics) and rebalancing triggers."
    ]
  }
];
