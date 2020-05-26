import React, { useEffect, useState, useCallback } from "react";
import { Storage } from "aws-amplify";

const S3Item = ({ fileKey, identityId, children }) => {
  const [src, setSrc] = useState();

  const getItem = useCallback(
    async function () {
      const result = await Storage.get(fileKey, {
        level: "protected",
        identityId,
      });

      setSrc(result);
    },
    [fileKey, identityId]
  );

  useEffect(() => {
    if (!identityId || !fileKey) return;

    getItem();
  }, [fileKey, identityId, getItem]);

  if (!fileKey || !identityId) return null;
  if (!src) return <p>Loading</p>;

  return children(src);
};

export default S3Item;
