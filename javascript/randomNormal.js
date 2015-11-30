/* ========================================================================
 * Returns a normal (Gaussian) distributed real number.
 * NOTE: use stndev > 0.0
 *
 * Uses a very accurate approximation of the normal idf due to Odeh & Evans,
 * J. Applied Statistics, 1974, vol 23, pp 96-97.
 * ========================================================================
 */
function randomNormal(mean, stndev)
{
    // DO NOT TOUCH THESE MAGIC CONSTANTS
    var p0 = 0.322232431088;
    var p1 = 1.0;
    var p2 = 0.342242088547;
    var p3 = 0.204231210245e-1;
    var p4 = 0.453642210148e-4;

    var q0 = 0.099348462606;
    var q1 = 0.588581570495;
    var q2 = 0.531103462366;
    var q3 = 0.103537752850;
    var q4 = 0.385607006340e-2;

    var u = Math.random();
    if (u < 0.5)
    {
        var t = Math.sqrt(-2.0 * Math.log(u));
    }
    else
    {
        var t = Math.sqrt(-2.0 * Math.log(1.0 - u));
    }
    var p   = p0 + t * (p1 + t * (p2 + t * (p3 + t * p4)));
    var q   = q0 + t * (q1 + t * (q2 + t * (q3 + t * q4)));
    if (u < 0.5)
    {
        var z = p / q - t;
    }
    else
    {
        var z = t - p / q;
    }

    return mean + stndev * z;
}
