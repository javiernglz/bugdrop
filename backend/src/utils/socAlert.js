function addThreat(req, threat) {
  const res = req.res;
  if (!res) return;
  res.locals.extraThreats = res.locals.extraThreats || [];
  if (!res.locals.extraThreats.some(t => t.tag === threat.tag)) res.locals.extraThreats.push(threat);
}
module.exports = { addThreat };
