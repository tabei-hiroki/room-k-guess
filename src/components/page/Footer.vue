<template>
    <footer>
        <div class="footer__container">
            <div class="licence">
                <p class="mb-0">
                    {{ version }} - {{ $t('Footer.under') }}
                    <a
                        href="https://github.com/GeoGuess/Geoguess/blob/master/LICENSE"
                    >MIT license</a>
                </p>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    computed: {
        version() {
            return require('../../../package.json').version;
        },
    },
};
</script>

<style lang="scss">
footer {
    background: var(--v-footer-base);
    .footer__container {
        padding: 0.5rem 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        justify-items: center;
        align-items: center;
        .theme--light & p, a {
            color: #484848;
        }
        .theme--dark & p, a {
            color: #FFFFFF;
        }
        a {
            font-weight: bold;
        }      
    }
    .footer__logo{        
        display: grid;
        grid-template-columns: repeat(4, minmax(36px, 1fr));
        justify-items: center;
        column-gap: 1.5rem;
    }
}

@media (max-width: 430px) {
    footer .footer__container div.licence{
        display: none;
    }
}
</style>
