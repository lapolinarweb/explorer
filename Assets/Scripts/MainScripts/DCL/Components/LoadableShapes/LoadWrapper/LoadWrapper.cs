﻿using DCL.Models;
using System;
using UnityEngine;

namespace DCL.Components
{
    public abstract class LoadWrapper : MonoBehaviour
    {
        public bool useVisualFeedback = true;
        public bool initialVisibility = true;
        public bool alreadyLoaded = false;

        public DecentralandEntity entity;
        public ContentProvider contentProvider;

        public abstract void Load(string url, Action<LoadWrapper> OnSuccess, Action<LoadWrapper> OnFail);
        public abstract void Unload();
    }
}