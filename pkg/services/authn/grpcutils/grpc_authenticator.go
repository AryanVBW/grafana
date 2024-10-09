package grpcutils

import (
	"crypto/tls"
	"net/http"

	authnlib "github.com/grafana/authlib/authn"

	"github.com/grafana/grafana/pkg/infra/tracing"
	"github.com/grafana/grafana/pkg/setting"
)

func NewGrpcAuthenticator(cfg *setting.Cfg, tracer tracing.Tracer) (*authnlib.GrpcAuthenticator, error) {
	authCfg, err := ReadGrpcServerConfig(cfg)
	if err != nil {
		return nil, err
	}
	grpcAuthCfg := authnlib.GrpcAuthenticatorConfig{
		KeyRetrieverConfig: authnlib.KeyRetrieverConfig{
			SigningKeysURL: authCfg.SigningKeysURL,
		},
		VerifierConfig: authnlib.VerifierConfig{
			AllowedAudiences: authCfg.AllowedAudiences,
		},
	}

	client := http.DefaultClient
	if cfg.Env == setting.Dev {
		// allow insecure connections in development mode to facilitate testing
		client = &http.Client{Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}}
	}
	keyRetriever := authnlib.NewKeyRetriever(grpcAuthCfg.KeyRetrieverConfig, authnlib.WithHTTPClientKeyRetrieverOpt(client))

	grpcOpts := []authnlib.GrpcAuthenticatorOption{
		authnlib.WithIDTokenAuthOption(true),
		authnlib.WithKeyRetrieverOption(keyRetriever),
	}
	if authCfg.Mode == ModeOnPrem {
		grpcOpts = append(grpcOpts,
			// Access token are not yet available on-prem
			authnlib.WithDisableAccessTokenAuthOption(),
		)
	}

	return authnlib.NewGrpcAuthenticator(
		&grpcAuthCfg,
		grpcOpts...,
	)
}

func NewInProcGrpcAuthenticator() *authnlib.GrpcAuthenticator {
	// In proc grpc ID token signature verification can be skipped
	return authnlib.NewUnsafeGrpcAuthenticator(
		&authnlib.GrpcAuthenticatorConfig{},
		authnlib.WithDisableAccessTokenAuthOption(),
		authnlib.WithIDTokenAuthOption(true),
	)
}
